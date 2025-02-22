import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  Alert,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import SvgImage from "../assets/image1.svg";
import { ThemeContext } from "../context/ThemeContext";
import { IP } from "@env";
export default function Register({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleSubmit = async () => {
    if (
      !fullName ||
      !userName ||
      !phone ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    const userData = { fullName, userName, phone, email, password };

    try {
      const response = await axios.post(
        `http://${IP}:5000/api/register`,
        userData,
        { headers: { "Content-Type": "application/json" } }
      );

      Alert.alert("Registration Successful", response.data.message);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Registration Error:", error.response?.data || error);
      const errorMessage = error.response?.data?.error || "Failed to register";
      Alert.alert("Registration Failed", errorMessage);
    }
  };

  return (
    <ScrollView className={isDarkMode ? "bg-gray-900" : "bg-white"}>
      <SafeAreaView className="flex-1 px-5 pt-10">
        <View className="items-center mt-5">
          <SvgImage width={180} height={180} />
        </View>

        <Text className="text-3xl font-bold text-center mt-5 text-primary">
          Create Account
        </Text>
        <Text className="text-center text-gray-500 text-sm mb-5">
          Hi, kindly fill in the form to proceed
        </Text>

        <View className="mt-5">
          {[
            { label: "Full Name", value: fullName, setter: setFullName },
            { label: "User Name", value: userName, setter: setUserName },
            { label: "Phone", value: phone, setter: setPhone },
            {
              label: "Email",
              value: email,
              setter: setEmail,
              keyboardType: "email-address",
            },
          ].map((input, index) => (
            <TextInput
              key={index}
              placeholder={input.label}
              placeholderTextColor={isDarkMode ? "#BBBBBB" : "#777777"}
              value={input.value}
              onChangeText={input.setter}
              keyboardType={input.keyboardType || "default"}
              className={`border-b-2 p-2 text-lg w-full mb-4 ${
                isDarkMode
                  ? "text-white border-pink-500"
                  : "text-black border-gray-600"
              }`}
            />
          ))}

          <View className="relative w-full">
            <TextInput
              placeholder="Password"
              placeholderTextColor={isDarkMode ? "#BBBBBB" : "#777777"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              className={`border-b-2 p-2 mt-5 mb-3 text-lg w-full ${
                isDarkMode
                  ? "text-white border-pink-500"
                  : "text-black border-gray-600"
              }`}
            />
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <EyeOff color="#aaa" /> : <Eye color="#aaa" />}
            </TouchableOpacity>
          </View>

          <View className="relative w-full">
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor={isDarkMode ? "#BBBBBB" : "#777777"}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!confirmPasswordVisible}
              className={`border-b-2 p-2 mt-5 mb-3 text-lg w-full ${
                isDarkMode
                  ? "text-white border-pink-500"
                  : "text-black border-gray-600"
              }`}
            />
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              {confirmPasswordVisible ? (
                <EyeOff color="#aaa" />
              ) : (
                <Eye color="#aaa" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="items-center">
          <TouchableOpacity
            className="w-3/4 mt-5 rounded-full overflow-hidden"
            onPress={handleSubmit} // Fixed placement
          >
            <LinearGradient
              colors={["#FF6480", "#F22E63"]}
              start={[0, 0]}
              end={[1, 0]}
              className="p-4 items-center rounded-full"
            >
              <Text className="text-white font-bold">Create Account</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="mt-5 items-center mb-10"
          onPress={() => navigation.navigate("Login")}
        >
          <Text className="text-gray-500">
            Already have an account?{" "}
            <Text className="text-pink-500">Login</Text>
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
}
