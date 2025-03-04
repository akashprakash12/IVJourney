import React, { useContext, useEffect, useState } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, TextInput, SafeAreaView, 
  ActivityIndicator, Pressable, Image, RefreshControl 
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { IP } from "@env";

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [packages, setPackages] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // ✅ For pull-to-refresh
  const [reload, setReload] = useState(false); // ✅ State to trigger re-fetch

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // 🔄 Fetch packages when the component mounts or `reload` changes
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://${IP}:5000/api/packages`);
        console.log(response.data);

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
            image: pkg.image.startsWith("http") ? pkg.image : `http://${IP}:5000/uploads/${pkg.image}`,
          })));
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoading(false);
        setRefreshing(false); // ✅ Stop pull-to-refresh indicator
      }
    };

    fetchPackages();
  }, [reload]); // ✅ Re-run when `reload` changes

  // ✅ Function to manually trigger a refresh
  const handleReload = () => {
    setReload(prev => !prev); // ✅ Toggle `reload` state to trigger `useEffect`
  };

  // ✅ Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    handleReload();
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name?.toLowerCase().includes(search.toLowerCase())
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
      {/* Search Bar & Refresh Button */}
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
          onPress={handleReload} // ✅ Manual refresh button
          className="ml-2 p-3 bg-blue-500 rounded-full"
        >
          <Text className="text-white font-bold">🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Package List */}
      <FlatList
        data={filteredPackages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PackageCard item={item} isDark={isDark} />}
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // ✅ Swipe-to-refresh
        }
      />
    </SafeAreaView>
  );
}

const PackageCard = ({ item, isDark }) => {
  const navigation = useNavigation();
  return (
    <Pressable  
      onPress={() => navigation.navigate("PackageDetails", { ...item })} 
      className={`rounded-lg p-4 mb-4 ${isDark ? "bg-secondary_2" : "bg-gray-100"}`}
    >
      <Image source={{ uri: item.image }} className="w-full h-64 rounded-lg mb-3" resizeMode="cover" />
      <View>
        <Text className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}>{item.name}</Text>
        <Text className={`mb-2 ${isDark ? "text-gray-400" : "text-gray-700"}`}>{item.description}</Text>
        <Text className={`text-lg font-bold ${isDark ? "text-primary_1" : "text-primary"}`}>
          {item.price}₹
        </Text>
        <View className="flex-row">
          {Array.from({ length: 5 }).map((_, index) => (
            <Text key={index} className={index < item.rating ? "text-yellow-400" : "text-gray-300"}>
              {index < item.rating ? "⭐" : "☆"}
            </Text>
          ))}
        </View>
      </View>
    </Pressable>
  );
};
