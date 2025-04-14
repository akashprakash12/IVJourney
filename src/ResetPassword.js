import React, { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { ThemeContext } from "../context/ThemeContext";
import { IP } from "@env";

export default function ResetPassword({ navigation, route }) {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(route.params?.token || "");
  const [email, setEmail] = useState(route.params?.email || "");

  useEffect(() => {
    const handleDeepLink = (event) => {
      if (event.url) {
        const url = new URL(event.url);
        const urlToken = url.searchParams.get("token");
        const urlEmail = url.searchParams.get("email");

        if (urlToken && urlEmail) {
          setToken(urlToken);
          setEmail(decodeURIComponent(urlEmail));
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, []);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return null;
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert("Error", passwordError);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    if (!token || !email) {
      Alert.alert("Error", "Invalid reset link. Please request a new password reset.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `http://${IP}:5000/api/reset-password`,
        { token, email, newPassword: password },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        Alert.alert("Success", response.data.message);
        navigation.navigate("Login");
      } else {
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      let errorMessage = "Failed to reset password";
      if (error.response) {
        errorMessage = error.response.data?.message || error.message;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className={`flex-1 p-5 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
      <Text className={`text-2xl font-bold mb-6 ${isDarkMode ? "text-white" : "text-black"}`}>
        Set New Password
      </Text>

      <TextInput
        placeholder="New Password"
        placeholderTextColor={isDarkMode ? "#BBBBBB" : "#777777"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className={`border-b-2 p-2 text-lg mb-4 ${
          isDarkMode ? "text-white border-pink-500" : "text-black border-gray-600"
        }`}
      />

      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor={isDarkMode ? "#BBBBBB" : "#777777"}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        className={`border-b-2 p-2 text-lg mb-6 ${
          isDarkMode ? "text-white border-pink-500" : "text-black border-gray-600"
        }`}
      />

      <TouchableOpacity onPress={handleResetPassword} disabled={loading}>
        <LinearGradient
          colors={["#FF6480", "#F22E63"]}
          className="p-4 rounded-lg items-center"
          start={[0, 0]}
          end={[1, 0]}
        >
          <Text className="text-white font-bold">
            {loading ? "Updating..." : "Update Password"}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}