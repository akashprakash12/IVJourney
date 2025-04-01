import React, { useState, useContext } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import { IP } from "@env";

export default function ForgotPassword({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`http://${IP}:5000/api/forgot-password`, { email });
      Alert.alert("Success", "Password reset link sent to your email");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={`flex-1 p-5 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <Text className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-black"}`}>
        Reset Password
      </Text>

      <TextInput
        placeholder="Enter your email"
        placeholderTextColor={isDarkMode ? "#BBBBBB" : "#777777"}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        className={`border-b-2 p-2 text-lg mb-6 ${
          isDarkMode ? "text-white border-pink-500" : "text-black border-gray-600"
        }`}
      />

      <TouchableOpacity 
        onPress={handleResetPassword}
        disabled={loading}
      >
        <LinearGradient
          colors={["#FF6480", "#F22E63"]}
          className="p-4 rounded-lg items-center"
          start={[0, 0]}
          end={[1, 0]}
        >
          <Text className="text-white font-bold">
            {loading ? "Sending..." : "Send Reset Link"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4"
        onPress={() => navigation.goBack()}
      >
        <Text className={`text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Remember your password? <Text className="text-pink-500">Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}