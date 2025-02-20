import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import SvgImage from "../assets/image1.svg";
import { StyleSheet } from "react-native";

export default function Register({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match!");
      return;
    }

    const userData = {
      fullName,
      userName,
      phone,
      email,
      password,
    };
    
    
    try {
      const ip = "192.168.1.6";
      const response = await axios.post(
        `http://${ip}:5000/api/register`,
        userData
      );
      
      console.log(response);
      

      Alert.alert("Registration Successful", response.data.message);

      // Navigate to login or home screen after successful registration
      navigation.navigate("Login");
      
      
    } catch (error) {
      //   console.error('Registration error:', error.response?.data || error.message);

        const errorMessage = error.response?.data?.error || 'Failed to register';
      Alert.alert("Registration Failed", errorMessage);
    }
    
  }
  


  return (
    <ScrollView>
      <SafeAreaView className="flex-1 bg-dark px-6 ite">
        <View className="items-center mt-10 mr-9 ml-9">
          {/* Illustration */}
          <SvgImage width={200} height={200}></SvgImage>
        </View>

        <Text className="text-primary text-4xl font-bold mb-6 ml-6 mt-6">
          Create Account
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          Hi, kindly fill in the form to proceed combat
        </Text>

        <View className="mt-5 space-y-4 items-center">
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#aaa"
            style={styles.textInput}
            value={fullName}
            onChangeText={setFullName}
            className="bg-secondary_2 text-white p-4 bg-transparent  w-96 border-primary_1 mt-5 "          />

          <TextInput
            placeholder="User Name"
            placeholderTextColor="#aaa"
            value={userName}
            onChangeText={setUserName}
            style={styles.textInput}
            className="bg-secondary_2 text-white p-4 bg-transparent  w-96 border-primary_1 mt-5 "
          />

          <TextInput
            placeholder="+234 Your Phone"
            placeholderTextColor="#aaa"
            value={phone}
            onChangeText={setPhone}
            style={styles.textInput}
            className="bg-secondary_2 text-white p-4 bg-transparent  w-96 border-primary_1 mt-5 "          />

          <TextInput
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            style={styles.textInput}
            className="bg-secondary_2 text-white p-4 bg-transparent  w-96 border-primary_1 mt-5 "            keyboardType="email-address"
          />

          <View className="relative mt-5">
            <TextInput
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              style={styles.textInput}
              className="bg-secondary_2 text-white p-4 bg-transparent  w-96 border-primary_1 "              secureTextEntry={!passwordVisible}
            />
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <EyeOff color="#aaa" /> : <Eye color="#aaa" />}
            </TouchableOpacity>
          </View>

          <View className="relative mt-5">
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#aaa"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.textInput}
              className="bg-secondary_2 text-white p-4 bg-transparent  w-96 border-primary_1 mb-5 "              secureTextEntry={!passwordVisible}
            />
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <EyeOff color="#aaa" /> : <Eye color="#aaa" />}
            </TouchableOpacity>
          </View>
        </View>
        <View className="items-center">
          <TouchableOpacity className="rounded-full overflow-hidden w-60 mt-5" onPress={handleSubmit}>
            <LinearGradient
              colors={["#FF6480", "#F22E63"]} // pink-500 to purple-500
              start={[0, 0]}
              end={[1, 0]}
              className="py-4 items-center"
            >
              <Text className="text-white font-bold">Create Account</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-4 space-x-4 items-center ">
          <TouchableOpacity className="bg-secondary_2 p-4 rounded-full mt-3 w-16 h-16 items-center">
            <Text className="text-white">G+</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-secondary_2 p-4 w-16 h-16 items-center rounded-full mt-3 ml-3">
            <Text className="text-white">F</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="mt-6 items-center mb-8">
          <Text className="text-gray-400">
            Already have an account?{" "}
            <Text className="text-primary_1" onPress={() => navigation.navigate("Login")}>Login</Text>
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    borderBottomWidth: 2// Set bottom border width
  },
});