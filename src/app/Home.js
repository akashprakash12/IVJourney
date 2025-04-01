import React, { useContext, useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput, SafeAreaView,
  ActivityIndicator, Pressable, Image, RefreshControl, Alert, StyleSheet, Animated
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { IP } from "@env";
import { AuthContext } from "../../context/Authcontext";
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [packages, setPackages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [reload, setReload] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const { userDetails } = useContext(AuthContext);
  const isStudent = userDetails?.role === "Student";
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://${IP}:5000/api/packages`);
        if (Array.isArray(response.data)) {
          setPackages(response.data.map(pkg => ({
            id: pkg._id || Math.random().toString(36).substr(2, 9),
            name: pkg.packageName,
            description: pkg.description || "No description available",
            duration: pkg.duration || "N/A",
            price: pkg.price || 0,
            rating: pkg.rating || 0,
            activities: pkg.activities || [],
            inclusions: pkg.inclusions || "Not specified",
            instructions: pkg.instructions || "No instructions available",
            image: pkg.image.startsWith("http") ? pkg.image : `http://${IP}:5000/uploads/general/${pkg.image}`,
            votes: pkg.votes || 0, // Total votes for this package
            votePercentage: pkg.votePercentage || 0, // Percentage of votes
          })));
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    };

    fetchPackages();
  }, [reload]);

  const handleVote = async (packageId) => {
    if (!userDetails || !userDetails._id) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    setIsVoting(true);
    try {
      const response = await axios.post(`http://${IP}:5000/api/packages/vote`, {
        studentId: userDetails._id,
        packageId,
      });
      Alert.alert("Success", response.data.message);
      setReload(prev => !prev);
    } catch (error) {
      console.error("Error voting:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to vote.");
    } finally {
      setIsVoting(false);
    }
  };

  const handleReload = () => {
    setReload(prev => !prev);
  };

  const onRefresh = () => {
    setRefreshing(true);
    handleReload();
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name?.toLowerCase().includes(search.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-dark">
        <ActivityIndicator size="large" color="#F22E63" />
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 px-6 ${isDark ? "bg-dark" : "bg-white"}`}>
      <View className="flex-row justify-between items-center mb-3 mt-5">
        <TextInput
          placeholder="Search for packages"
          placeholderTextColor={isDark ? "#aaa" : "#333"}
          value={search}
          onChangeText={setSearch}
          className={`flex-1 p-4 border rounded-full ${
            isDark ? "bg-inputBg border-gray-600 text-white" : "bg-white border-gray-300 text-black"
          }`}
        />
        <TouchableOpacity
          onPress={handleReload}
          className="ml-4 p-3 bg-primary rounded-full"
        >
          <FontAwesome name="refresh" size={15} color={isDark ? "white" : "black"} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPackages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PackageCard
            item={item}
            isDark={isDark}
            handleVote={handleVote}
            isStudent={isStudent}
            isVoting={isVoting}
          />
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const PackageCard = ({ item, isDark, handleVote, isStudent, isVoting }) => {
  const navigation = useNavigation();
  const progress = new Animated.Value(item.votePercentage);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: item.votePercentage,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [item.votePercentage]);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <Pressable
      onPress={() => navigation.navigate("PackageDetails", { ...item })}
      className={`rounded-lg p-4 mb-4 ${isDark ? "bg-secondary_2" : "bg-gray-100"}`}
    >
      {!isStudent && (
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/150" }}
          className="w-full h-64 rounded-lg mb-3"
          resizeMode="cover"
          onError={(e) => console.log("Image failed to load:", e.nativeEvent.error)}
        />
      )}

      <View>
        <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}>{item.name}</Text>
        <Text className={`mb-2 ${isDark ? "text-gray-400" : "text-gray-700"}`}>{item.description}</Text>
        <Text className={`text-lg font-bold ${isDark ? "text-primary_1" : "text-primary"}`}>
          {item.price}₹
        </Text>
        <View className="mt-2">
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width, backgroundColor: isDark ? "#F22E63" : "#4CAF50" },
              ]}
            />
          </View>
          <Text className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-700"}`}>
            {item.votePercentage.toFixed(2)}% votes
          </Text>
        </View>
      </View>

      {isStudent && (
        <>
          <Pressable
            onPress={() => navigation.navigate("PackageDetails", { ...item })}
            className="bg-primary px-4 py-2 rounded-lg mb-2"
          >
            <Text className="text-white font-bold">Detail</Text>
          </Pressable>
          <Pressable
            onPress={() => handleVote(item.id)}
            disabled={isVoting}
            className={`bg-secondary px-4 py-2 rounded-lg ${isVoting ? "opacity-50" : ""}`}
          >
            <Text className="text-white font-bold">Vote</Text>
          </Pressable>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});