import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../../context/ThemeContext";
import { AuthContext } from "../../../context/Authcontext";
import { IP } from "@env";
import axios from "axios";

// Reusable Rating Component
const Rating = ({ rating }) => {
  return (
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
  );
};

// Reusable DetailSection Component
const DetailSection = ({ title, children, textColor }) => {
  if (!children) return null;
  return (
    <View className="mb-6">
      <Text className={`text-lg font-semibold ${textColor} mb-2`}>{title}</Text>
      {children}
    </View>
  );
};

// Reusable ReviewItem Component
const ReviewItem = ({ review }) => {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";
  const textColor = isDarkMode ? "text-white" : "text-gray-800";
  const secondaryTextColor = isDarkMode ? "text-gray-400" : "text-gray-600";

  const { user = {}, rating, comment, date } = review;

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image
            source={{ uri: user.avatar || "https://via.placeholder.com/150" }}
            className="w-10 h-10 rounded-full"
          />
          <Text className={`ml-3 font-medium ${textColor}`}>
            {user.name || "Anonymous User"}
          </Text>
        </View>
        <Rating rating={rating} />
      </View>
      <Text className={`mt-2 ${secondaryTextColor}`}>{comment}</Text>
      <Text className={`mt-1 text-sm ${secondaryTextColor}`}>{date}</Text>
    </View>
  );
};

// Main PackageDetails Component
export default function PackageDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useContext(ThemeContext);
  const { userDetails } = useContext(AuthContext);

  const isDarkMode = theme === "dark";
  const bgColor = isDarkMode ? "bg-[#121212]" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-gray-900";
  const secondaryTextColor = isDarkMode ? "text-gray-400" : "text-gray-700";
  const highlightColor = isDarkMode ? "text-yellow-400" : "text-yellow-600";
  const cardBg = isDarkMode ? "bg-[#1E1E1E]" : "bg-gray-100";

  const {
    _id, // Package ID from route params
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
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState([]);

  // Check if the user is a student
  const isStudent = userDetails?.role === "Student";

  // Fetch reviews from the backend
  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(`http://${IP}:5000/packages/${_id}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      Alert.alert("Error", "Failed to fetch reviews.");
    }
  }, [_id]);

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  // Fetch reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle adding a comment
  const handleAddComment = async () => {
    try {
      if (!userDetails || !userDetails._id) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      if (userRating < 1 || userRating > 5) {
        Alert.alert("Error", "Please provide a rating between 1 and 5.");
        return;
      }

      const payload = {
        userId: userDetails._id,
        rating: userRating,
        comment: userComment,
      };

      const response = await axios.post(`http://${IP}:5000/packages/${_id}/feedback`, payload);
      console.log("Feedback submitted successfully:", response.data);

      // Reset fields and close modal
      setUserRating(0);
      setUserComment("");
      setIsCommentModalVisible(false);

      // Refresh reviews
      fetchReviews();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
    }
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  return (
    <SafeAreaView className={`flex-1 ${bgColor}`}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className={`py-6 px-4 flex-row items-center ${bgColor}`}>
          <Text className={`text-2xl font-bold flex-1 text-center ${textColor}`}>
            {name}
          </Text>
        </View>

        {/* Image */}
        <View className="px-4">
          <Image
            source={{ uri: image || "https://via.placeholder.com/150" }}
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
            <Rating rating={rating} />
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

          {/* Comment Button (Only for Students) */}
          {isStudent && (
            <TouchableOpacity
              className={`flex-row items-center justify-center mt-4 p-3 rounded-xl ${cardBg}`}
              onPress={() => setIsCommentModalVisible(true)}
            >
              <Ionicons name="chatbubble-outline" size={20} color={highlightColor} />
              <Text className={`${highlightColor} ml-2 font-semibold`}>
                Add a Comment
              </Text>
            </TouchableOpacity>
          )}

          {/* Reviews Section */}
          <DetailSection title="⭐ Customer Reviews" textColor={textColor}>
            {displayedReviews.length > 0 ? (
              <>
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
              </>
            ) : (
              <Text className={`${secondaryTextColor} text-center`}>
                No reviews yet. Be the first to leave a review!
              </Text>
            )}
          </DetailSection>
        </View>
      </ScrollView>

      {/* Comment Modal (Only for Students) */}
      {isStudent && (
        <Modal
          visible={isCommentModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsCommentModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            className="flex-1 justify-end"
          >
            <View
              className={`p-6 rounded-t-3xl ${isDarkMode ? "bg-[#1E1E1E]" : "bg-white"}`}
            >
              <Text className={`text-xl font-bold mb-4 ${textColor}`}>
                Add Your Feedback
              </Text>

              {/* Rating Section */}
              <View className="flex-row items-center mb-4">
                <Text className={`${textColor} mr-3`}>Rating:</Text>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setUserRating(index + 1)}
                  >
                    <Ionicons
                      name={index < userRating ? "star" : "star-outline"}
                      size={24}
                      color={index < userRating ? "#FFD700" : "#C0C0C0"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Comment Input */}
              <TextInput
                className={`p-4 rounded-xl ${cardBg} ${textColor}`}
                placeholder="Write your comment..."
                placeholderTextColor={secondaryTextColor}
                multiline
                value={userComment}
                onChangeText={setUserComment}
              />

              {/* Submit Button */}
              <TouchableOpacity
                className={`mt-6 p-3 rounded-xl bg-[#F22E63] items-center`}
                onPress={handleAddComment}
              >
                <Text className="text-white font-semibold">Submit</Text>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                className={`mt-4 p-3 rounded-xl ${cardBg} items-center`}
                onPress={() => setIsCommentModalVisible(false)}
              >
                <Text className={`${highlightColor} font-semibold`}>Close</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </SafeAreaView>
  );
}