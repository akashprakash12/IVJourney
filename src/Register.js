import React, { useState } from "react";
import { View, TextInput, Button, Alert, Text } from "react-native";
import axios from "axios";

export default function Register({ navigation }) {
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
      async function getDeviceIP() {
        try {
            const response = await axios.get('http://api.ipify.org?format=json');
            return response.data.ip; // Returns the public IP of your device
        } catch (error) {
            console.error('Error fetching IP:', error);
        }
    }
    // const ip = await getDeviceIP();
    const ip='192.168.1.5'
      const response = await axios.post(
        `http://${ip}:5000/api/register`,
        formData
      );

      //   Alert.alert('Registration Successful', response.data.message);

      // Navigate to login or home screen after successful registration
      navigation.navigate("Login");
    } catch (error) {
      //   console.error('Registration error:', error.response?.data || error.message);

      //   const errorMessage = error.response?.data?.error || 'Failed to register';
      Alert.alert("Registration Failed", errorMessage);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => handleChange("email", value)}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={formData.password}
        onChangeText={(value) => handleChange("password", value)}
        style={{ marginBottom: 10 }}
      />
      <Button title="Register" onPress={handleSubmit} />
      {errors.email ? (
        <Text style={{ color: "red" }}>{errors.email}</Text>
      ) : null}
      {errors.password ? (
        <Text style={{ color: "red" }}>{errors.password}</Text>
      ) : null}
    </View>
  );
}
