import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../../context/ThemeContext";
import { IP } from "@env";
import { AuthContext } from "../../../context/Authcontext";



const DetailSection = ({ title, children, textColor }) => {
  if (!children) return null;
  return (
    <View className="mb-6">
      <Text className={`text-lg font-semibold ${textColor} mb-2`}>{title}</Text>
      {children}
    </View>
  );
};

const handlePackageSelection = async () => {
  const { userDetails, setUserDetails } = useContext(AuthContext);
console.log(userDetails);
  try {
   
    const response = await axios.post(`http://${IP}/api/select-package`, {
      userId: use,
      packageName: name,
      price: price,
    });

    if (response.status === 201) {
      alert("Package Selected Successfully!");
    } else {
      alert(`Error: ${response.data.message}`);
    }
  } catch (error) {
    console.error("Error selecting package:", error);
    alert("Failed to select package. Please try again.");
  }
};


export default function PackageDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useContext(ThemeContext);

  const isDarkMode = theme === "dark";
  const bgColor = isDarkMode ? "bg-[#121212]" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-gray-900";
  const secondaryTextColor = isDarkMode ? "text-gray-400" : "text-gray-700";
  const highlightColor = isDarkMode ? "text-yellow-400" : "text-yellow-600";
  const cardBg = isDarkMode ? "bg-[#1E1E1E]" : "bg-gray-100";

  const {
    name = "Unknown Package",
    description = "No description available.",
    duration = "N/A",
    price = "0",
    rating = 0,
    image = "",
    activities = [],
    inclusions = [], // ✅ Ensures inclusions is always an array
    instructions = "No instructions available.",
  } = route.params || {};
  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className={`py-6 px-4 flex-row items-center ${bgColor}`}>
<<<<<<< HEAD
          
          <Text className={`text-xl font-bold flex-1 text-center ${textColor}`}>{name}</Text>
=======
          <Pressable onPress={() => navigation.goBack()} className="p-2">
            <Ionicons
              name="arrow-back"
              size={26}
              color={isDarkMode ? "white" : "black"}
            />
          </Pressable>
          <Text className={`text-xl font-bold flex-1 text-center ${textColor}`}>
            {name}
          </Text>
>>>>>>> c633036f7872bed54f41a42136fe61df75e44495
        </View>

        {/* Image */}
        <Image
          source={{ uri: image }}
          className="w-full h-64 rounded-2xl mx-4 shadow-lg"
          resizeMode="cover"
        />

        {/* Details Section */}
        <View className={`p-6 rounded-t-3xl mt-4 ${bgColor}`}>
          <View className="items-center mb-6">
<<<<<<< HEAD
            <Text className="bg-[#F22E63] text-black text-lg font-bold px-6 py-2 rounded-full">
=======
            <Text className="bg-gradient-to-r from-[#F22E63] to-[#F58220] text-white text-lg font-bold px-6 py-2 rounded-full shadow-md">
>>>>>>> c633036f7872bed54f41a42136fe61df75e44495
              {price}₹ Per Person
            </Text>
          </View>

          <DetailSection title="📌 Description" textColor={textColor}>
            <Text className={`${secondaryTextColor} text-base leading-relaxed`}>
              {description}
            </Text>
          </DetailSection>

          <DetailSection title="⏳ Duration" textColor={textColor}>
            <Text className={`text-lg font-medium ${highlightColor}`}>
              {duration}
            </Text>
          </DetailSection>

          <DetailSection title="⭐ Rating" textColor={textColor}>
            <View className="flex-row">
              {Array.from({ length: 5 }).map((_, index) => (
                <Text
                  key={index}
                  className={
                    index < rating
                      ? "text-yellow-400 text-xl"
                      : secondaryTextColor
                  }
                >
                  {index < rating ? "⭐" : "☆"}
                </Text>
              ))}
            </View>
          </DetailSection>

          <DetailSection title="🎁 Package Inclusions" textColor={textColor}>
            {Array.isArray(inclusions) && inclusions.length > 0 ? (
              inclusions.map((item, index) => (
                <View
                  key={index}
                  className={`flex-row items-center mt-2 p-2 rounded-xl ${cardBg}`}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#F22E63" />
                  <Text className={`${secondaryTextColor} ml-3 text-base`}>
                    {item}
                  </Text>
                </View>
              ))
            ) : (
              <Text className={`${secondaryTextColor} mt-2`}>
                No inclusions available.
              </Text>
            )}
          </DetailSection>

          <DetailSection title="📅 Daily Activities" textColor={textColor}>
            {activities.length ? (
              activities.map((activity, index) => (
                <View key={index} className="flex-row items-start mt-4">
                  <View className="items-center">
                    <View className="w-3 h-3 bg-[#F22E63] rounded-full" />
                    {index !== activities.length - 1 && (
                      <View className="w-[2px] h-6 bg-[#F22E63] mt-1" />
                    )}
                  </View>
                  <Text className={`${secondaryTextColor} ml-4 text-base`}>
                    {activity}
                  </Text>
                </View>
              ))
            ) : (
              <Text className={`${secondaryTextColor} mt-2`}>
                No activities listed.
              </Text>
            )}
          </DetailSection>

          <DetailSection title="📝 Instructions" textColor={textColor}>
            <Text className={secondaryTextColor}>
              {instructions || "No instructions available."}
            </Text>
          </DetailSection>
        </View>
      </ScrollView>

      {/* Floating Button */}
      <View className="absolute bottom-4 left-4 right-4 flex-row justify-center">
        <TouchableOpacity
          className="bg-[#F22E63] py-3 px-6 rounded-full shadow-md"
          onPress={handlePackageSelection}
        >
          <Text className="text-white text-lg font-semibold">
            Select Package
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
