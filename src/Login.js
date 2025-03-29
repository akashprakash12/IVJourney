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
import { ThemeContext } from "../context/ThemeContext"; // Import theme context
import { IP,API_BASE_URL } from "@env";
import { AuthContext } from "../context/Authcontext";


export default function Login({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark"; // Determine current mode
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      const response = await axios.post(
        `http://${IP}:5000/api/Login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } } // Ensure JSON format
      );

      Alert.alert("Login Successful", response.data.message);
   
      const { token, role, userDetails } = response.data;
      
       login(role, token,userDetails);
  
       // Navigate to Home after login
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed";
      Alert.alert("Login Failed", errorMessage);
    }
  };

  return (
    <ScrollView className={isDarkMode ? "bg-gray-900" : "bg-white"}>
      <SafeAreaView className="flex-1 px-5 pt-10">
        <View className="items-center mt-5">
          <SvgImage width={200} height={200} />
        </View>

        <Text className="text-3xl font-bold text-center mt-10 text-primary">
          Welcome Back
        </Text>
        <Text className="text-center text-gray-500 text-sm mb-5">
          Sign in to continue
        </Text>

        <View className="mt-5">
          <TextInput
            placeholder="Email"
            placeholderTextColor={isDarkMode ? "#BBBBBB" : "#777777"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            className={`border-b-2 p-2 text-lg w-full mb-4 ${
              isDarkMode ? "text-white border-pink-500" : "text-black border-gray-600"
            }`}
          />

          <View className="relative w-full">
            <TextInput
              placeholder="Password"
              placeholderTextColor={isDarkMode ? "#BBBBBB" : "#777777"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
              className={`border-b-2 p-2 text-lg w-full ${
                isDarkMode ? "text-white border-pink-500" : "text-black border-gray-600"
              }`}
            />
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <EyeOff color="#aaa" /> : <Eye color="#aaa" />}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          className="self-end mr-2 mt-2"
          onPress={() => Alert.alert("Forgot Password", "Reset link sent to your email.")}
        >
          <Text className="text-pink-500">Forgot Password?</Text>
        </TouchableOpacity>

        {/* Fix: Moved onPress to TouchableOpacity */}
        <View className="items-center">
          <TouchableOpacity 
            className="w-3/4 mt-5 rounded-full overflow-hidden" 
            onPress={handleLogin} // Fixed placement
          >
            <LinearGradient
              colors={["#FF6480", "#F22E63"]}
              start={[0, 0]}
              end={[1, 0]}
              className="p-4 items-center rounded-full"
            >
              <Text className="text-white font-bold">Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="mt-5 items-center mb-10"
          onPress={() => navigation.navigate("Register")}
        >
          <Text className="text-gray-500">
            Don't have an account? <Text className="text-pink-500">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
}
