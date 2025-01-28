import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, View, Alert } from "react-native";
import * as Location from "expo-location";

const OSRM_API_URL = "https://router.project-osrm.org/route/v1/driving";

export default function Locations() {
  const mapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const destination = {
    latitude: 37.7749, // Example destination: San Francisco
    longitude: -122.4194,
  };

  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please enable location permissions.");
        return;
      }

      // Get the current location
      let location = await Location.getCurrentPositionAsync({});
      const current = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(current);

      // Fetch route from OSRM
      fetchRoute(current, destination);

      // Focus the map on the user's location
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            ...current,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          },
          1000
        );
      }
    })();
  }, []);

  const fetchRoute = async (origin, destination) => {
    try {
      // Construct OSRM API URL
      const url = `${OSRM_API_URL}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        // Decode the GeoJSON route
        const coordinates = data.routes[0].geometry.coordinates.map((coord) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        setRouteCoordinates(coordinates);
      } else {
        Alert.alert("Error", "Unable to fetch route.");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      Alert.alert("Error", "Failed to fetch route. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: currentLocation?.latitude || 37.33,
          longitude: currentLocation?.longitude || -122,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* User's Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            description="This is your current location"
          />
        )}

        {/* Destination Marker */}
        <Marker
          coordinate={destination}
          title="Destination"
          description="Your destination"
        />

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="blue"
            strokeWidth={4}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
