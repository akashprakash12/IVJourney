import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import { StyleSheet, View, Alert } from "react-native";
import * as Location from "expo-location";
import fetch from 'node-fetch';

const OSRM_API_URL = "https://router.project-osrm.org/route/v1/driving";

export default function NearbyRoute() {
  const mapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    (async () => {
      try {
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

        // Generate a nearby destination (~1 km offset)
        const nearbyDestination = {
          latitude: current.latitude + 0.01, // ~1 km north
          longitude: current.longitude + 0.01, // ~1 km east
        };
        setDestination(nearbyDestination);

        // Fetch route between current location and nearby destination
        await fetchRoute(current, nearbyDestination);

        // Focus the map on the user's location
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              ...current,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            },
            1000
          );
        }
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert("Error", "Failed to get current location.");
      }
    })();
  }, []);

  const fetchRoute = async (origin, destination) => {
    try {
      // Construct OSRM API URL
      const url = `${OSRM_API_URL}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson`;
      console.log("OSRM API URL:", url);

      const response = await fetch(url);
      const data = await response.json();
      console.log("OSRM Response:", data);

      if (data.code === "NoRoute") {
        Alert.alert("No Route Found", "No route could be calculated between these points.");
        return;
      }

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
        showsUserLocation={true}
        showsMyLocationButton={true}
        initialRegion={{
          latitude: currentLocation?.latitude || 37.33,
          longitude: currentLocation?.longitude || -122,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* OpenStreetMap Tiles */}
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {/* User's Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            description="This is your current location"
          />
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker
            coordinate={destination}
            title="Nearby Destination"
            description="This is a nearby location"
          />
        )}

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#FF0000"
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