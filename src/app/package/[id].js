import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../../context/ThemeContext";

const DetailSection = ({ title, children, textColor }) => {
  if (!children) return null;
  return (
    <View className="mb-6">
      <Text className={`text-lg font-semibold ${textColor} mb-2`}>{title}</Text>
      {children}
    </View>
  );
};

const ReviewItem = ({ review }) => {
  const { user, rating, comment, date } = review;

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image
            source={{ uri: user.avatar }}
            className="w-10 h-10 rounded-full"
          />
          <Text className="ml-3 font-medium text-gray-800">{user.name}</Text>
        </View>
        <View className="flex-row">
          {Array.from({ length: 5 }).map((_, index) => (
            <Ionicons
              key={index}
              name={index < rating ? "star" : "star-outline"}
              size={16}
              color={index < rating ? "#FFD700" : "#C0C0C0"}
            />
          ))}
        </View>
      </View>
      <Text className="mt-2 text-gray-600">{comment}</Text>
      <Text className="mt-1 text-sm text-gray-500">{date}</Text>
    </View>
  );
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
    inclusions = [],
    instructions = "No instructions available.",
  } = route.params || {};

  const [showAllReviews, setShowAllReviews] = useState(false);

  // Sample reviews data
  const reviews = [
    {
      user: { name: "John Doe", avatar: "https://via.placeholder.com/150" },
      rating: 4,
      comment: "Great package! Had a wonderful time.",
      date: "2023-10-01",
    },
    {
      user: { name: "Jane Smith", avatar: "https://via.placeholder.com/150" },
      rating: 5,
      comment: "Amazing experience! Highly recommended.",
      date: "2023-09-25",
    },
    {
      user: { name: "Alice Johnson", avatar: "https://via.placeholder.com/150" },
      rating: 3,
      comment: "It was okay, but could be better.",
      date: "2023-09-20",
    },
  ];

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className={`py-6 px-4 flex-row items-center ${bgColor}`}>
          <Text className={`text-2xl font-bold flex-1 text-center ${textColor}`}>
            {name}
          </Text>
        </View>

        {/* Image */}
        <View className="px-4">
          <Image
            source={{ uri: image }}
            className="w-full h-72 rounded-2xl shadow-lg"
            resizeMode="cover"
          />
        </View>

        {/* Details Section */}
        <View className={`p-6 rounded-t-3xl mt-4 ${bgColor}`}>
          {/* Price Badge */}
          <View className="items-center mb-6">
            <Text className="bg-[#F22E63] text-white text-lg font-bold px-6 py-2 rounded-full">
              {price}₹ Per Person
            </Text>
          </View>

          {/* Description */}
          <DetailSection title="📌 Description" textColor={textColor}>
            <Text className={`${secondaryTextColor} text-base leading-relaxed`}>
              {description}
            </Text>
          </DetailSection>

          {/* Duration */}
          <DetailSection title="⏳ Duration" textColor={textColor}>
            <Text className={`text-lg font-medium ${highlightColor}`}>
              {duration}
            </Text>
          </DetailSection>

          {/* Rating */}
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

          {/* Inclusions */}
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

          {/* Activities */}
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

          {/* Instructions */}
          <DetailSection title="📝 Instructions" textColor={textColor}>
            <Text className={secondaryTextColor}>
              {instructions || "No instructions available."}
            </Text>
          </DetailSection>

          {/* Reviews Section */}
          <DetailSection title="⭐ Customer Reviews" textColor={textColor}>
            {displayedReviews.map((review, index) => (
              <ReviewItem key={index} review={review} />
            ))}
            {reviews.length > 2 && (
              <TouchableOpacity
                onPress={() => setShowAllReviews(!showAllReviews)}
                className="mt-4"
              >
                <Text className={`text-center ${highlightColor} font-semibold`}>
                  {showAllReviews ? "Show Less" : "See All Reviews"}
                </Text>
              </TouchableOpacity>
            )}
          </DetailSection>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}