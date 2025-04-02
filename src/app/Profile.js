import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { IP } from "@env";
import { AuthContext } from "../../context/Authcontext";
import FormData from 'form-data';

export default function ProfileScreen({ navigation }) {
  const { userDetails, setUserDetails } = useContext(AuthContext);
  
  // Debug logs
  console.log("User details from context:", userDetails);
  console.log("Full name from context:", userDetails?.name);

  // States with proper initialization
  const [name, setname] = useState(userDetails?.name || "");
  const [studentID, setStudentID] = useState(userDetails?.studentID || "");
  const [industryID, setIndustryID] = useState(userDetails?.industryID || "");
  const [semester, setSemester] = useState(userDetails?.semester || "");
  const [branch, setBranch] = useState(userDetails?.branch || "");
  const [email, setEmail] = useState(userDetails?.email || "");
  const [phone, setPhone] = useState(userDetails?.phone || "");
  const [image, setImage] = useState(userDetails?.profileImage || null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!email) return;
      
      try {
        console.log("Fetching profile for:", email);
        const response = await axios.get(`http://${IP}:5000/api/getProfile/${email}`);
        const data = response.data;
        console.log("Profile data received:", data);

        // Update states with proper field names
        setname(data.name || userDetails?.name || "");
        setStudentID(data.studentID || "");
        setIndustryID(data.industryID || "");
        setBranch(data.branch || "");
        setSemester(data.semester || "");
        setPhone(data.phone || "");
        setImage(data.profileImage || null);
        
        // Update context if needed
        if (data.name && data.name !== userDetails?.name) {
          setUserDetails(prev => ({
            ...prev,
            name: data.name
          }));
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        Alert.alert("Error", "Couldn't fetch profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [email]);

  // Image picker function
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Allow access to pick an image.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // Form submission
  const handleSubmit = async () => {
    if (!name || !phone) {
      Alert.alert("Error", "Name and phone are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("branch", branch);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("semester", semester);

      if (studentID) formData.append("studentID", studentID);
      if (industryID) formData.append("industryID", industryID);

      if (image && !image.startsWith("http")) {
        let filename = image.split("/").pop();
        let type = `image/${filename.split('.').pop()}`;
        
        formData.append("profileImage", {
          uri: image,
          name: filename,
          type: type,
        });
      }

      console.log("Submitting profile update...");
      const response = await axios.post(
        `http://${IP}:5000/api/updateProfile`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Update response:", response.data);
      
      // Update context with new data
      setUserDetails(prev => ({
        ...prev,
        name,
        studentID,
        industryID,
        branch,
        semester,
        phone,
        profileImage: response.data.profileImage || image,
      }));

      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", error.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#E91E63" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="px-5 pt-10" contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-2xl font-bold text-center text-pink-600 mb-6">
          My Profile
        </Text>

        {/* Profile Picture Section */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{ uri: image || "https://via.placeholder.com/150" }}
              className="w-32 h-32 rounded-full border-4 border-pink-500"
            />
            <View className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full">
              <FontAwesome5 name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-bold mt-3 text-gray-800">
            {name || "No name set"}
          </Text>
        </View>

        {/* Profile Form */}
        <View className="space-y-6">
          {/* Full Name Field */}
          <View>
            <Text className="text-gray-600 font-medium mb-1">Full Name</Text>
            <TextInput
              className="border-b-2 border-pink-500 text-lg py-2 text-gray-800"
              value={name}
              onChangeText={setname}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              editable={true}
            />
          </View>

          {/* Student ID (Conditional) */}
          {userDetails?.role === "Student" && (
            <View>
              <Text className="text-gray-600 font-medium mb-1">Student ID</Text>
              <TextInput
                className="border-b-2 border-pink-500 text-lg py-2 text-gray-800"
                value={studentID}
                onChangeText={setStudentID}
                editable={false}
              />
            </View>
          )}

          {/* Industry ID (Conditional) */}
          {userDetails?.role === "Industry Representative" && (
            <View>
              <Text className="text-gray-600 font-medium mb-1">Industry ID</Text>
              <TextInput
                className="border-b-2 border-pink-500 text-lg py-2 text-gray-800"
                value={industryID}
                onChangeText={setIndustryID}
                editable={false}
              />
            </View>
          )}

          {/* Branch and Semester (Conditional) */}
          {(userDetails?.role === "Student" || userDetails?.role === "Student Leader") && (
            <>
              <View>
                <Text className="text-gray-600 font-medium mb-1">Branch</Text>
                <TextInput
                  className="border-b-2 border-pink-500 text-lg py-2 text-gray-800"
                  value={branch}
                  onChangeText={setBranch}
                  editable={true}
                />
              </View>
              <View>
                <Text className="text-gray-600 font-medium mb-1">Semester</Text>
                <TextInput
                  className="border-b-2 border-pink-500 text-lg py-2 text-gray-800"
                  value={semester}
                  onChangeText={setSemester}
                  keyboardType="numeric"
                />
              </View>
            </>
          )}

          {/* Email Field */}
          <View>
            <Text className="text-gray-600 font-medium mb-1">Email</Text>
            <TextInput
              className="border-b-2 border-gray-300 text-lg py-2 text-gray-500"
              value={email}
              editable={false}
            />
          </View>

          {/* Phone Field */}
          <View>
            <Text className="text-gray-600 font-medium mb-1">Phone Number</Text>
            <TextInput
              className="border-b-2 border-pink-500 text-lg py-2 text-gray-800"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="bg-pink-500 py-3 rounded-lg mt-8 items-center"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold text-lg">Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}