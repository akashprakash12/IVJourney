import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login({ navigation }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (value) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async () => {
    let newErrors = { email: "", password: "" };
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    try {
      const ip = "192.168.1.50"; // Default localhost for Android Emulator

console.log(formData);

      const response = await axios.post(
        `http://${ip}:5000/api/Login`,
        formData
      );
console.log(response);

      const { token, message } = response.data;
      Alert.alert("Login Successful", message);

      await AsyncStorage.setItem("authToken", token);
      navigation.navigate("Home");
    } catch (error) {
      // console.error("Login error:", error.response?.data || error.message);

      const errorMessage = error.response?.data?.error || "Failed to login";
      Alert.alert("Login Failed", errorMessage);
    }
  };
    return (
    <View className="flex-1 justify-center items-center px-4 bg-blue-50">
      <Text className="text-2xl font-bold mb-5">Login</Text>

      <View className="w-full max-w-lg bg-white p-6 rounded-xl shadow-md">
        <TextInput
          className={`h-12 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg px-4 mb-4`}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(value) => handleChange("email", value)}
        />
        {errors.email && (
          <Text className="text-red-500 text-xs">{errors.email}</Text>
        )}

        <TextInput
          className={`h-12 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-lg px-4 mb-4`}
          placeholder="Password"
          secureTextEntry
          value={formData.password}
          onChangeText={(value) => handleChange("password", value)}
        />
        {errors.password && (
          <Text className="text-red-500 text-xs">{errors.password}</Text>
        )}

        <Button title="Submit" onPress={handleSubmit} color="#4F83CC" />

        <TouchableOpacity>
          <Text className="text-blue-600 text-center mt-4 underline">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text className="text-blue-600 text-center mt-4 underline">
            Don't have an account? Register here
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}