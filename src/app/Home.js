import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import axios from "axios";

function Package({ name, description, duration, price, rating }) {
  return (
    <View className="bg-primary rounded-lg p-4 mb-4">
      <Text className="text-white text-lg font-bold">{name}</Text>
      <Text className="text-gray-300 mb-2">{description}</Text>
      <Text className="text-yellow-400 mb-2">{duration}</Text>
      <Text className="text-yellow-400 text-lg font-bold">{price}₹</Text>
      <View className="flex-row">
        {Array.from({ length: 5 }).map((_, index) => (
          <Text
            key={index}
            className={index < rating ? "text-yellow-400" : "text-gray-300"}
          >
            {index < rating ? "⭐" : "☆"}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function HomeScreen() {
 
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [packages, setPackages] = useState([]);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(
        "https://raw.githubusercontent.com/akashprakash12/TestAPI/refs/heads/main/db.json"
      );
  
      // Check the structure of the response data
      console.log("API Response Data:", response.data);
  
      // Ensure the data is an array
      if (Array.isArray(response.data)) {
        setPackages(response.data); // Directly set the array
      } else {
        console.error("Unexpected data format. Expected an array:", response.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setIsLoading(false);
    }
  };
  

  useEffect(() => {
    fetchPackages();
  }, []);
  const filteredPackages = Array.isArray(packages)
  ? packages.filter((pkg) =>
      pkg.name.toLowerCase().includes(search.toLowerCase())
    )
  : [];


  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary px-6">
      <View className="flex-1 bg-secondary p-4">
        <Text className="text-white text-xl mb-4 mt-5">Welcome</Text>
        <TextInput
          placeholder="Search for packages"
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          className="bg-secondary_2 text-white p-4 bg-transparent border rounded-full mb-3  border-primary_1 mt-5"
        />
        <View className="flex-row justify-between mb-4 mt-3">
          <TouchableOpacity
            onPress={() => setSearch("")}
            className="flex-row bg-primary py-2 px-4 rounded"
          >
            <Entypo name="cross" size={20} color="white" />
            <Text className="text-white ml-2">Clear</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredPackages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Package
              name={item.name}
              description={item.description}
              duration={item.duration}
              price={item.price}
              rating={item.rating}
            />
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      
      </View>
    </SafeAreaView>
  );
}
