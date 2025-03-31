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
import { IP } from "@env"; // Your backend IP
import { AuthContext } from "../../context/Authcontext";
import FormData from 'form-data';


export default function ProfileScreen({ navigation }) {
  const { userDetails, setUserDetails } = useContext(AuthContext); // Get user details and setter function

  // States for user data
  const [name, setName] = useState(userDetails?.fullName || "");
  const [studentID, setStudentID] = useState(userDetails?.studentID || "");
  const [industryID, setindustryID] = useState(userDetails?.industryID|| "");
  const [semester, setSemester] = useState(userDetails?.semester || "");
  
  const [branch, setBranch] = useState(userDetails?.branch || "");
  const [email, setEmail] = useState(userDetails?.email || ""); // Email should not be updated
  const [phone, setPhone] = useState(userDetails?.phone || "");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Profile Data on Component Mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `http://${IP}:5000/api/getProfile/${email}`
        );
        const data = response.data;
console.log(data);

        setName(data.name || "");
        setStudentID(data.studentID || "");
        setBranch(data.branch || "");
        setSemester(data.semester || "");
        setPhone(data.phone || "");
        setImage(data.profileImage || null);
      } catch (error) {
        // console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchProfile();
  }, [email]);

  // Pick Image Function
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

  // Submit Form Data
  const handleSubmit = async () => {
    if (!name || !phone) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("branch", branch);
      formData.append("phone", phone);
      formData.append("email", email); // Email should not change
      formData.append("semester", semester); // Add this line

      if (studentID || industryID) {
        formData.append("studentID", studentID);
        formData.append("industryID", industryID);
      }
      

      if (image && !image.startsWith("http")) {
        let filename = image.split("/").pop();
        let ext = filename.split(".").pop();
        let type = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

        formData.append("profileImage", {
          uri: image,
          name: filename,
          type: type,
        });
      }

      console.log("Form Data: ", formData);

      const response = await axios.post(
        `http://${IP}:5000/api/updateProfile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Server Response: ", response.data);

      // Update AuthContext to reflect changes immediately
      setUserDetails((prev) => ({
        ...prev,
        fullName: name,
        studentID: studentID,
        branch: branch,
        phone: phone,
        profileImage: response.data.profileImage || image,
      }));

      Alert.alert("Success", response.data.message);
    } catch (error) {
      console.error("Update Failed:", error);
      Alert.alert(
        "Update Failed",
        error.response?.data?.message || "Something went wrong."
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
    <ScrollView className="flex-1 bg-white px-5 pt-10"  keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 100 }}>
    <Text className="text-2xl font-bold text-center text-pink-600">
      Profile
    </Text>

    {loading ? (
      <ActivityIndicator size="large" color="#E91E63" className="mt-10" />
    ) : (
      <>
        {/* Profile Section */}
        <View className="items-center mt-5">
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{ uri: image || "https://via.placeholder.com/100" }}
              className="w-24 h-24 rounded-full border-2 border-pink-500"
            />
            <View className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full">
              <FontAwesome5 name="sync-alt" size={14} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-lg font-semibold mt-2">{name}</Text>
        </View>

        {/* Form Fields */}
        <View className="mt-5">
          <Text className="text-gray-600 font-semibold">Full Name</Text>
          <TextInput
            className="border-b-2 border-pink-500 text-lg py-1"
            value={name}
            onChangeText={setName}
          />

          {/* Student ID - Only for Students */}
          {userDetails?.role === "Student" && (
            <>
              <Text className="text-gray-600 font-semibold mt-3">Student ID</Text>
              <TextInput
                className="border-b-2 border-pink-500 text-lg py-1"
                value={studentID}
                onChangeText={setStudentID}
              />
            </>
          )}

          {/* Branch - Only for Students and Student Leaders */}
          {(userDetails?.role === "Student" || userDetails?.role === "Student Leader") && (
            <>
              <Text className="text-gray-600 font-semibold mt-3">Branch</Text>
              <TextInput
                className="border-b-2 border-pink-500 text-lg py-1"
                value={branch}
                onChangeText={setBranch}
              />
                <Text className="text-gray-600 font-semibold mt-3">Semester</Text>
          <TextInput
            className="border-b-2 border-pink-500 text-lg py-1"
            value={semester}
            onChangeText={setSemester}
            placeholder="Enter your semester (e.g., 3rd)"
            keyboardType="numeric"
          />
                  </>
          )}

          {/* Industry ID - Only for Industry Representatives */}
          {userDetails?.role === "Industry Representative" && (
            <>
              <Text className="text-gray-600 font-semibold mt-3">Industry ID</Text>
              <TextInput
                className="border-b-2 border-pink-500 text-lg py-1"
                value={industryID}
                onChangeText={setindustryID}
              />
            </>
          )}

          <Text className="text-gray-600 font-semibold mt-3">Email</Text>
          <TextInput
            className="border-b-2 border-gray-300 text-lg py-1 bg-gray-100 text-gray-500"
            value={email}
            editable={false}
            onChangeText={setEmail}
          />

          <Text className="text-gray-600 font-semibold mt-3">Phone Number</Text>
          <TextInput
            className="border-b-2 border-pink-500 text-lg py-1"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          className="bg-pink-500 py-3 rounded-lg mt-5 items-center"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold text-lg">Save Changes</Text>
        </TouchableOpacity>
      </>
    )}
  </ScrollView>
  </SafeAreaView>
  );
}
