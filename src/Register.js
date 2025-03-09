import React, { useState, useContext, useEffect } from "react";
import {
  View,
  TextInput,
  Alert,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Eye, EyeOff, User, Mail, Smartphone } from "lucide-react-native"; // Modern icons
import { LinearGradient } from "expo-linear-gradient";
import SvgImage from "../assets/image1.svg";
import { ThemeContext } from "../context/ThemeContext";
import RNPickerSelect from "react-native-picker-select"; // Dropdown
import { IP } from "@env";
import axios from "axios";


export default function Register({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  // User Data
  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(""); // Role selection
  const [studentID, setStudentID] = useState("");
  const [industryID, setIndustryID] = useState("");

  // Password Visibility
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Generate Random ID
  const generateID = (prefix) => {
    return `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
  };

  // Auto-generate ID based on Role Selection
  useEffect(() => {
    if (role === "Student") {
      setStudentID(generateID("STU"));
      setIndustryID("");
    } else if (role === "Industry Representative") {
      setIndustryID(generateID("IND"));
      setStudentID("");
    } else {
      setStudentID("");
      setIndustryID("");
    }
  }, [role]);

  // Form Submission
  const handleSubmit = async () => {
    if (!fullName || !userName || !phone || !email || !password || !confirmPassword || !role) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    const userData = {
      fullName,
      userName,
      phone,
      email,
      password,
      role,
      studentID: role === "Student" ? studentID : null,
      industryID: role === "Industry Representative" ? industryID : null,
    };

    try {
      const response = await axios.post(
        `http://${IP}:5000/api/register`,
        userData,
        { headers: { "Content-Type": "application/json" } }
      );

      Alert.alert("Success", response.data.message);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Registration Error:", error.response?.data || error);
      const errorMessage = error.response?.data?.error || "Failed to register";
      Alert.alert("Registration Failed", errorMessage);
    }
  };

  return (
    <ScrollView className={isDarkMode ? "bg-gray-900" : "bg-white"}>
      <SafeAreaView className="flex-1 px-6 pt-8">
        {/* Logo */}
        <View className="items-center">
          <SvgImage width={160} height={160} />
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-center mt-5 text-primary">
          Sign Up
        </Text>
        <Text className="text-center text-gray-500 text-sm mb-5">
          Create an account to get started!
        </Text>

        <View className="mt-5">
          {/* Role Selection Dropdown */}
          <Text className="text-gray-700 font-medium mb-2">Select Role</Text>
          <RNPickerSelect
            onValueChange={setRole}
            items={[
              { label: "Student", value: "Student" },
              { label: "Student Leader (Admin)", value: "Student Leader" },
              { label: "HOD", value: "HOD" },
              { label: "Industry Representative", value: "Industry Representative" },
            ]}
            placeholder={{ label: "Choose a role...", value: null }}
            style={{ inputAndroid: { color: isDarkMode ? "#FFF" : "#000" } }}
          />

          {/* Auto-Generated IDs */}
          {role === "Student" && (
            <View className="mt-4">
              <Text className="text-gray-700 font-medium">Student ID</Text>
              <View className="border rounded-full bg-gray-200 p-3 items-center">
                <Text className="text-black font-semibold">{studentID}</Text>
              </View>
            </View>
          )}
          {role === "Industry Representative" && (
            <View className="mt-4">
              <Text className="text-gray-700 font-medium">Industry ID</Text>
              <View className="border rounded-full bg-gray-200 p-3 items-center">
                <Text className="text-black font-semibold">{industryID}</Text>
              </View>
            </View>
          )}

          {/* Input Fields */}
          {[
            { label: "Full Name", value: fullName, setter: setFullName, icon: <User size={20} color="#777" /> },
            { label: "User Name", value: userName, setter: setUserName, icon: <User size={20} color="#777" /> },
            { label: "Phone", value: phone, setter: setPhone, icon: <Smartphone size={20} color="#777" /> },
            { label: "Email", value: email, setter: setEmail, icon: <Mail size={20} color="#777" />, keyboardType: "email-address" },
          ].map((input, index) => (
            <View key={index} className="flex-row items-center border-b p-2 mb-4">
              {input.icon}
              <TextInput
  placeholder={input.label}
  placeholderTextColor={isDarkMode ? "#DDD" : "#777"}
  value={input.value}
  onChangeText={input.setter}
  keyboardType={input.keyboardType || "default"}
  className={`ml-3 flex-1 text-lg ${isDarkMode ? "text-white" : "text-black"}`}
/>
            </View>
          ))}

          {/* Password Inputs */}
          {[{ label: "Password", value: password, setter: setPassword, visible: passwordVisible, setVisible: setPasswordVisible },
            { label: "Confirm Password", value: confirmPassword, setter: setConfirmPassword, visible: confirmPasswordVisible, setVisible: setConfirmPasswordVisible }]
            .map((input, index) => (
              <View key={index} className="relative border-b p-2 mb-4">
                <TextInput
                  placeholder={input.label}
                  placeholderTextColor="#777"
                  value={input.value}
                  onChangeText={input.setter}
                  secureTextEntry={!input.visible}
                  className={`ml-3 flex-1 text-lg ${isDarkMode ? "text-white" : "text-black"}`}
                />
                <TouchableOpacity className="absolute right-4 top-3" onPress={() => input.setVisible(!input.visible)}>
                  {input.visible ? <EyeOff size={20} color="#777" /> : <Eye size={20} color="#777" />}
                </TouchableOpacity>
              </View>
          ))}

          {/* Submit Button */}
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
                       <Text className="text-white font-bold">Create account</Text>
                     </LinearGradient>
                   </TouchableOpacity>
                 </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
