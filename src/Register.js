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
  const [gender, setGender] = useState(""); // Gender selection

  // Password Visibility
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Error States
  const [errors, setErrors] = useState({
    fullName: "",
    userName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    gender: "",
  });

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

  // Validation Functions
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^\d{10}$/; // Assumes a 10-digit phone number
    return regex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 8; // Minimum 8 characters
  };

  const handleSubmit = async () => {
    // Reset errors
    setErrors({
      fullName: "",
      userName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      gender: "",
    });

    // Validate fields
    let isValid = true;
    if (!fullName) {
      setErrors((prev) => ({ ...prev, fullName: "Full Name is required." }));
      isValid = false;
    }
    if (!userName) {
      setErrors((prev) => ({ ...prev, userName: "User Name is required." }));
      isValid = false;
    }
    if (!phone) {
      setErrors((prev) => ({ ...prev, phone: "Phone is required." }));
      isValid = false;
    } else if (!validatePhone(phone)) {
      setErrors((prev) => ({ ...prev, phone: "Invalid phone number." }));
      isValid = false;
    }
    if (!email) {
      setErrors((prev) => ({ ...prev, email: "Email is required." }));
      isValid = false;
    } else if (!validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email address." }));
      isValid = false;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: "Password is required." }));
      isValid = false;
    } else if (!validatePassword(password)) {
      setErrors((prev) => ({ ...prev, password: "Password must be at least 8 characters long." }));
      isValid = false;
    }
    if (!confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Confirm Password is required." }));
      isValid = false;
    } else if (password !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match." }));
      isValid = false;
    }
    if (!role) {
      setErrors((prev) => ({ ...prev, role: "Role is required." }));
      isValid = false;
    }
    if (!gender) {
      setErrors((prev) => ({ ...prev, gender: "Gender is required." }));
      isValid = false;
    }

    if (!isValid) return;

    const userData = {
      fullName,
      userName,
      phone,
      email,
      password,
      role,
      gender,
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

      // Handle specific error for duplicate phone or email
      if (error.response?.status === 400 && error.response?.data?.error) {
        Alert.alert("Registration Failed", error.response.data.error);
      } else {
        Alert.alert("Registration Failed", "An unexpected error occurred. Please try again.");
      }
    }
  };

  // RadioButton Component
  const RadioButton = ({ label, selected, onPress }) => {
    return (
      <TouchableOpacity
        className="flex-row items-center mr-4"
        onPress={onPress}
      >
        <View
          className={`w-5 h-5 rounded-full border-2 ${
            selected
              ? "border-primary bg-primary"
              : "border-gray-400 bg-transparent"
          }`}
        >
          {selected && <View className="w-2 h-2 rounded-full bg-white m-auto" />}
        </View>
        <Text className={`ml-2 ${isDarkMode ? "text-white" : "text-black"}`}>
          {label}
        </Text>
      </TouchableOpacity>
    );
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
          {errors.role && <Text className="text-red-500 text-sm mt-1">{errors.role}</Text>}

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
            { label: "Full Name", value: fullName, setter: setFullName, icon: <User size={20} color="#777" />, error: errors.fullName },
            { label: "User Name", value: userName, setter: setUserName, icon: <User size={20} color="#777" />, error: errors.userName },
            { label: "Phone", value: phone, setter: setPhone, icon: <Smartphone size={20} color="#777" />, error: errors.phone },
            { label: "Email", value: email, setter: setEmail, icon: <Mail size={20} color="#777" />, keyboardType: "email-address", error: errors.email },
          ].map((input, index) => (
            <View key={index}>
              <View className="flex-row items-center border-b p-2 mb-4">
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
              {input.error && <Text className="text-red-500 text-sm mt-1">{input.error}</Text>}
            </View>
          ))}

          {/* Gender Selection Radio Buttons */}
          <Text className="text-gray-700 font-medium mb-5 mt-4">Select Gender</Text>
          <View className="flex-row">
            <RadioButton
              label="Male"
              selected={gender === "Male"}
              onPress={() => setGender("Male")}
            />
            <RadioButton
              label="Female"
              selected={gender === "Female"}
              onPress={() => setGender("Female")}
            />
            <RadioButton
              label="Other"
              selected={gender === "Other"}
              onPress={() => setGender("Other")}
            />
          </View>
          {errors.gender && <Text className="text-red-500 text-sm mt-1">{errors.gender}</Text>}

          {/* Password Inputs */}
          {[
            { label: "Password", value: password, setter: setPassword, visible: passwordVisible, setVisible: setPasswordVisible, error: errors.password },
            { label: "Confirm Password", value: confirmPassword, setter: setConfirmPassword, visible: confirmPasswordVisible, setVisible: setConfirmPasswordVisible, error: errors.confirmPassword },
          ].map((input, index) => (
            <View key={index}>
              <View className="relative border-b p-2 mb-4">
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
              {input.error && <Text className="text-red-500 text-sm mt-1">{input.error}</Text>}
            </View>
          ))}

          {/* Submit Button */}
          <View className="items-center">
            <TouchableOpacity 
              className="w-3/4 mt-5 rounded-full overflow-hidden" 
              onPress={handleSubmit}
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