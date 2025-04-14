import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker, Polyline, UrlTile, Callout } from "react-native-maps";
import { 
  StyleSheet, 
  View, 
  Alert, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  FlatList,
  ActivityIndicator
} from "react-native";
import * as Location from "expo-location";
import debounce from 'lodash.debounce';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from "react-native-gesture-handler";

// Use OSRM India instance for routing
const OSRM_INDIA_API_URL = "https://routing.openstreetmap.de/routed-car/route/v1/driving";
const NOMINATIM_API_URL = "https://nominatim.openstreetmap.org/search";

export default function NearbyRoute() {
  const mapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [destination, setDestination] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(false);
  const lastRequestTime = useRef(0);
  const [poiData, setPoiData] = useState({
    petrolPumps: [],
    foodSpots: [],
    parking: []
  });
  const [nearestPoi, setNearestPoi] = useState({
    petrolPump: null,
    foodSpot: null,
    parking: null
  });

  // Get cached suggestions
  const getCachedSuggestions = async (query) => {
    try {
      const cached = await AsyncStorage.getItem(`geo_${query}`);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  };

  const updateCurrentLocationAndRoute = async () => {
    try {
      setIsLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please enable location permissions.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(newLocation);
      
      if (destination) {
        await fetchRoute(newLocation, destination);
      }

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...newLocation,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 1000);
      }
    } catch (error) {
      console.error("Error updating location:", error);
      Alert.alert("Error", "Failed to update current location.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to fetch POIs along the route
  const fetchPOIsAlongRoute = async (coordinates) => {
    if (!coordinates || coordinates.length < 2) return;

    try {
      // Get bounding box of the route
      const lats = coordinates.map(c => c.latitude);
      const lons = coordinates.map(c => c.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);

      // Overpass API query for amenities along the route
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];
        (
          node["amenity"="fuel"](${minLat},${minLon},${maxLat},${maxLon});
          node["amenity"="restaurant"](${minLat},${minLon},${maxLat},${maxLon});
          node["amenity"="fast_food"](${minLat},${minLon},${maxLat},${maxLon});
          node["amenity"="cafe"](${minLat},${minLon},${maxLat},${maxLon});
          node["amenity"="parking"](${minLat},${minLon},${maxLat},${maxLon});
        );
        out body;>;out skel qt;`;

      const response = await fetch(overpassUrl);
      const data = await response.json();

      // Process the POIs
      const petrolPumps = [];
      const foodSpots = [];
      const parking = [];

      data.elements.forEach(element => {
        if (element.tags) {
          const poi = {
            id: element.id,
            latitude: element.lat,
            longitude: element.lon,
            name: element.tags.name || 'Unnamed',
            type: element.tags.amenity
          };

          if (element.tags.amenity === 'fuel') {
            petrolPumps.push(poi);
          } 
          else if (['restaurant', 'fast_food', 'cafe'].includes(element.tags.amenity)) {
            foodSpots.push(poi);
          }
          else if (element.tags.amenity === 'parking') {
            parking.push(poi);
          }
        }
      });

      setPoiData({ petrolPumps, foodSpots, parking });
      findNearestPOIs(currentLocation, { petrolPumps, foodSpots, parking });
    } catch (error) {
      console.error("Error fetching POIs:", error);
    }
  };

  // Helper function to find nearest POIs
  const findNearestPOIs = (location, pois) => {
    if (!location) return;

    let nearestPump = null;
    let minPumpDist = Infinity;
    
    let nearestFood = null;
    let minFoodDist = Infinity;
    
    let nearestParking = null;
    let minParkingDist = Infinity;

    // Find nearest petrol pump
    pois.petrolPumps.forEach(pump => {
      const dist = calculateDistance(
        location.latitude,
        location.longitude,
        pump.latitude,
        pump.longitude
      );
      if (dist < minPumpDist) {
        minPumpDist = dist;
        nearestPump = { 
          ...pump, 
          distance: dist ? dist.toFixed(1) : 'N/A'
        };
      }
    });

    // Find nearest food spot
    pois.foodSpots.forEach(food => {
      const dist = calculateDistance(
        location.latitude,
        location.longitude,
        food.latitude,
        food.longitude
      );
      if (dist < minFoodDist) {
        minFoodDist = dist;
        nearestFood = { 
          ...food, 
          distance: dist ? dist.toFixed(1) : 'N/A'
        };
      }
    });

    // Find nearest parking
    pois.parking.forEach(park => {
      const dist = calculateDistance(
        location.latitude,
        location.longitude,
        park.latitude,
        park.longitude
      );
      if (dist < minParkingDist) {
        minParkingDist = dist;
        nearestParking = { 
          ...park, 
          distance: dist ? dist.toFixed(1) : 'N/A'
        };
      }
    });

    setNearestPoi({
      petrolPump: nearestPump,
      foodSpot: nearestFood,
      parking: nearestParking
    });
  };

  // Cache suggestions
  const cacheSuggestions = async (query, data) => {
    try {
      await AsyncStorage.setItem(
        `geo_${query}`,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (e) {
      console.log('Caching failed', e);
    }
  };

  // Fetch suggestions with debounce and caching - India focused
  const fetchSuggestions = debounce(async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setSuggestionsError(false);
      return;
    }

    // Rate limiting - 1 request per second (Nominatim's requirement)
    const now = Date.now();
    if (now - lastRequestTime.current < 1000) return;
    lastRequestTime.current = now;

    setIsLoading(true);
    setSuggestionsError(false);

    try {
      // Try cache first (1 hour cache)
      const cached = await getCachedSuggestions(query);
      if (cached && (now - cached.timestamp < 3600000)) {
        setSuggestions(cached.data);
        setIsLoading(false);
        return;
      }

      // Add India as the default country to prioritize Indian locations
      const nominatimUrl = `${NOMINATIM_API_URL}?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`;
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'IndiaRouteFinder/1.0 (your@email.com)',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error("Didn't receive JSON");
      }

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid response format");

      const processed = data.map(item => ({
        name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }));

      setSuggestions(processed);
      await cacheSuggestions(query, processed);
    } catch (error) {
      console.error("Geocoding error:", error);
      setSuggestions([]);
      setSuggestionsError(true);
    } finally {
      setIsLoading(false);
    }
  }, 500);

  const handleInputChange = (text) => {
    setToInput(text);
    setShowSuggestions(true);
    fetchSuggestions(text);
  };

  const selectSuggestion = (suggestion) => {
    setToInput(suggestion.name);
    setDestination({
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    });
    setShowSuggestions(false);
    fetchRoute(currentLocation, {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    });
  };

  // Calculate distance between coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return isNaN(distance) ? 0 : distance;
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  // Fetch route from OSRM India instance
  const fetchRoute = async (origin, destination) => {
    if (!origin || !destination) return;

    try {
      setIsLoading(true);
      const url = `${OSRM_INDIA_API_URL}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&overview=full`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === "NoRoute") {
        Alert.alert("No Route Found", "No route could be calculated between these points.");
        return;
      }

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0],
        }));

        setRouteCoordinates(coordinates);
        setDistance((route.distance / 1000).toFixed(2)); // Convert to km
        setDuration((route.duration / 60).toFixed(1)); // Convert to minutes

        // Fetch POIs along the new route
        fetchPOIsAlongRoute(coordinates);

        // Zoom to fit route
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      Alert.alert("Error", "Failed to fetch route. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuggestions = () => {
    return suggestions.map((item, index) => (
      <TouchableOpacity 
        key={index.toString()}
        style={styles.suggestionItem}
        onPress={() => selectSuggestion(item)}
      >
        <Text style={styles.suggestionText} numberOfLines={1}>{item.name}</Text>
      </TouchableOpacity>
    ));
  };

  // Get current location on mount
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Please enable location permissions.");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const current = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setCurrentLocation(current);
        setFromInput("My Current Location");

        if (mapRef.current) {
          mapRef.current.animateToRegion({
            ...current,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }, 1000);
        }
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert("Error", "Failed to get current location.");
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        ref={mapRef}
        showsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: currentLocation?.latitude || 20.5937,
          longitude: currentLocation?.longitude || 78.9629,
          latitudeDelta: 15,
          longitudeDelta: 15,
        }}
      >
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
  
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            description="This is your current location"
          />
        )}
  
        {destination && (
          <Marker
            coordinate={destination}
            title="Destination"
            description={toInput}
          />
        )}
  
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#4F46E5"
            strokeWidth={4}
          />
        )}
  
        {/* POI Markers */}
        {poiData.petrolPumps.map((pump, index) => (
          <Marker
            key={`pump-${index}`}
            coordinate={{ latitude: pump.latitude, longitude: pump.longitude }}
            pinColor="#F59E0B"
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>Petrol Pump</Text>
                <Text>{pump.name}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
  
        {poiData.foodSpots.map((food, index) => (
          <Marker
            key={`food-${index}`}
            coordinate={{ latitude: food.latitude, longitude: food.longitude }}
            pinColor="#10B981"
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>Food Spot</Text>
                <Text>{food.name}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
  
        {poiData.parking.map((park, index) => (
          <Marker
            key={`park-${index}`}
            coordinate={{ latitude: park.latitude, longitude: park.longitude }}
            pinColor="#3B82F6"
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>Parking</Text>
                <Text>{park.name}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
  
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.controlsContainer}>
            {/* Input Sections */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>FROM</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={fromInput}
                  editable={false}
                />
              </View>
            </View>
  
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>TO</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={toInput}
                  onChangeText={handleInputChange}
                  placeholder="Search for a location in India"
                  placeholderTextColor="#9CA3AF"
                  onFocus={() => setShowSuggestions(true)}
                />
                {isLoading && (
                  <ActivityIndicator style={styles.loadingIndicator} color="#4F46E5" />
                )}
              </View>
            </View>
  
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {renderSuggestions()}
              </View>
            )}
  
            {/* Error Message */}
            {suggestionsError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Search service unavailable</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => fetchSuggestions(toInput)}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
  
            {/* Route Information Cards */}
            {distance && duration && (
              <View style={styles.infoCardsContainer}>
                <View style={[styles.infoCard, styles.distanceCard]}>
                  <Text style={styles.cardTitle}>DISTANCE</Text>
                  <Text style={styles.cardValue}>{distance} km</Text>
                </View>
                
                <View style={[styles.infoCard, styles.durationCard]}>
                  <Text style={styles.cardTitle}>DURATION</Text>
                  <Text style={styles.cardValue}>~{duration} mins</Text>
                </View>
              </View>
            )}
  
            {/* Points of Interest Section */}
            {routeCoordinates.length > 0 && (
              <View style={styles.poiSection}>
                <Text style={styles.sectionTitle}>POINTS OF INTEREST</Text>
                <View style={styles.poiContainer}>
                  <View style={styles.poiItem}>
                    <Text style={styles.poiIcon}>⛽</Text>
                    <Text style={styles.poiText}>
                      {nearestPoi.petrolPump 
                        ? `Nearest Petrol Pump: ${nearestPoi.petrolPump.distance}km (${nearestPoi.petrolPump.name})`
                        : 'No petrol pumps found nearby'}
                    </Text>
                  </View>
                  <View style={styles.poiItem}>
                    <Text style={styles.poiIcon}>🍴</Text>
                    <Text style={styles.poiText}>
                      {nearestPoi.foodSpot 
                        ? `Nearest Food Spot: ${nearestPoi.foodSpot.distance}km (${nearestPoi.foodSpot.name})`
                        : 'No food spots found nearby'}
                    </Text>
                  </View>
                  <View style={styles.poiItem}>
                    <Text style={styles.poiIcon}>🅿️</Text>
                    <Text style={styles.poiText}>
                      {nearestPoi.parking 
                        ? `Nearest Parking: ${nearestPoi.parking.distance}km (${nearestPoi.parking.name})`
                        : 'No parking found nearby'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
  
            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryButton, isLoading && styles.disabledButton]} 
                onPress={updateCurrentLocationAndRoute}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Update Route</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, isLoading && styles.disabledButton]} 
                onPress={() => {
                  if (destination) {
                    fetchRoute(currentLocation, destination);
                  } else {
                    Alert.alert("Error", "Please select a destination first");
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Show Route</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Layout
  calloutContainer: {
    width: 150,
    padding: 8,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  poiIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  poiText: {
    fontSize: 14,
    flexShrink: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  map: {
    width: "100%",
    height: "50%",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  controlsContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },

  // Input Sections
  inputSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#111827',
    fontWeight: '500',
  },
  loadingIndicator: {
    position: 'absolute',
    right: 16,
    top: 16,
  },

  // Suggestions
  suggestionsContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    maxHeight: 200,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionText: {
    fontSize: 14,
    color: '#374151',
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginRight: 10,
  },
  retryButton: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  retryText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },

  // Info Cards
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
  },
  distanceCard: {
    backgroundColor: '#EFF6FF',
  },
  durationCard: {
    backgroundColor: '#ECFDF5',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  // POI Section
  poiSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  poiContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  poiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  // poiIcon: {
  //   marginRight: 12,
  //   fontSize: 16,
  // },
  // poiText: {
  //   fontSize: 14,
  //   color: '#374151',
  //   fontWeight: '500',
  // },

  // Action Buttons
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
});