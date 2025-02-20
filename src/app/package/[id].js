import React, { useContext } from "react";
import { View, Text, Image, ScrollView, Pressable, SafeAreaView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../../context/ThemeContext";
const DetailSection = ({ title, children, textColor }) => {
  if (!children) return null;
  return (
    <View className="mb-6">
      <Text className={`text-lg font-semibold ${textColor}`}>{title}</Text>
      {children}
    </View>
  );
};

export default function PackageDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useContext(ThemeContext); // Get theme from context

  // Define colors based on theme
  const isDarkMode = theme === "dark";
  const bgColor = isDarkMode ? "bg-[#1C1C1E]" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-gray-900";
  const secondaryTextColor = isDarkMode ? "text-gray-300" : "text-gray-700";
  const highlightColor = isDarkMode ? "text-yellow-400" : "text-yellow-600";

  // Extract route params
  const { 
    name, 
    description, 
    duration, 
    price, 
    rating, 
    image, 
    activities = [], 
    inclusions = [], 
    instructions 
  } = route.params || {};

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <ScrollView>
        {/* Header */}
        <View className={`py-6 px-4 flex-row items-center ${bgColor}`}>
          <Pressable onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? "white" : "black"} />
          </Pressable>
          <Text className={`text-xl font-bold flex-1 text-center ${textColor}`}>{name}</Text>
        </View>

        {/* Image */}
        <Image source={{ uri: image }} className="w-full h-64 rounded-lg" resizeMode="cover" />

        {/* Details Section */}
        <View className={`p-6 rounded-t-3xl ${bgColor}`}>
          <View className="items-center mb-6">
            <Text className="bg-[#F22E63] text-white text-lg font-bold px-6 py-2 rounded-full">
              {price}₹ Per Person
            </Text>
          </View>

          {/* Sections */}
          <DetailSection title="📌 Description" textColor={textColor}>
            <Text className={secondaryTextColor}>{description}</Text>
          </DetailSection>

          <DetailSection title="⏳ Duration" textColor={textColor}>
            <Text className={highlightColor}>{duration}</Text>
          </DetailSection>

          <DetailSection title="⭐ Rating" textColor={textColor}>
            <View className="flex-row">
              {Array.from({ length: 5 }).map((_, index) => (
                <Text key={index} className={index < rating ? "text-yellow-400" : secondaryTextColor}>
                  {index < rating ? "⭐" : "☆"}
                </Text>
              ))}
            </View>
          </DetailSection>

          {/* Inclusions */}
          <DetailSection title="🎁 Package Inclusions" textColor={textColor}>
            {Array.isArray(inclusions) && inclusions.length > 0 ? (
              inclusions.map((item, index) => (
                <View key={index} className="flex-row items-center mt-2">
                  <Ionicons name="checkmark-circle" size={18} color="#F22E63" />
                  <Text className={`${secondaryTextColor} ml-2`}>{item}</Text>
                </View>
              ))
            ) : (
              <Text className={`${secondaryTextColor} mt-2`}>No inclusions available.</Text>
            )}
          </DetailSection>

          {/* Activities */}
          <DetailSection title="📅 Daily Activities" textColor={textColor}>
            {Array.isArray(activities) && activities.length > 0 ? (
              activities.map((activity, index) => (
                <View key={index} className="flex-row items-start mt-4">
                  <View className="items-center">
                    <View className="w-3 h-3 bg-[#F22E63] rounded-full" />
                    {index !== activities.length - 1 && <View className="w-[2px] h-6 bg-[#F22E63] mt-1" />}
                  </View>
                  <Text className={`${secondaryTextColor} ml-4`}>{activity}</Text>
                </View>
              ))
            ) : (
              <Text className={`${secondaryTextColor} mt-2`}>No activities listed.</Text>
            )}
          </DetailSection>

          {/* Instructions */}
          <DetailSection title="📝 Instructions" textColor={textColor}>
            <Text className={secondaryTextColor}>{instructions || "No instructions available."}</Text>
          </DetailSection>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
