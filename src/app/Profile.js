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
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { IP } from "@env";
import { AuthContext } from "../../context/Authcontext";
import FormData from 'form-data';

export default function ProfileScreen({ navigation }) {
  const { userDetails, setUserDetails } = useContext(AuthContext);
  const [name, setName] = useState(userDetails?.fullName || "");
  const [studentID, setStudentID] = useState(userDetails?.studentID || "");
  const [industryID, setindustryID] = useState(userDetails?.industryID || "");
  const [branch, setBranch] = useState(userDetails?.branch || "");
  const [email, setEmail] = useState(userDetails?.email || "");
  const [phone, setPhone] = useState(userDetails?.phone || "");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `http://${IP}:5000/api/getProfile/${email}`
        );
        const data = response.data;
        setName(data.name || "");
        setStudentID(data.studentID || "");
        setBranch(data.branch || "");
        setPhone(data.phone || "");
        setImage(data.profileImage || null);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchProfile();
  }, [email]);

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
      formData.append("email", email);

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

      const response = await axios.post(
        `http://${IP}:5000/api/updateProfile`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

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
      Alert.alert("Update Failed", error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <LinearGradient colors={['#f3e7e9', '#e3eeff']} className="flex-1">
      <ScrollView className="px-5 pt-12" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-8">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 bg-white rounded-full shadow-lg"
          >
            <MaterialIcons name="arrow-back" size={24} color="#E91E63" />
          </TouchableOpacity>
          <Text className="text-3xl font-extrabold text-gray-800">My Profile</Text>
          <View className="w-8" />
        </View>

        {loading ? (
          <View className="items-center justify-center h-96">
            <ActivityIndicator size="large" color="#E91E63" />
          </View>
        ) : (
          <>
            <LinearGradient
              colors={['#FF7597', '#FF7EB3']}
              className="rounded-3xl p-6 shadow-xl mx-2 mb-8"
            >
              <View className="items-center -mt-16">
                <TouchableOpacity onPress={pickImage} className="relative">
                  <LinearGradient
                    colors={['#FF7597', '#FF3366']}
                    className="w-32 h-32 rounded-full p-1"
                  >
                    <Image
                      source={{ uri: image || "https://via.placeholder.com/100" }}
                      className="w-full h-full rounded-full border-4 border-white"
                    />
                  </LinearGradient>
                  <View className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md">
                    <Feather name="edit-3" size={16} color="#FF3366" />
                  </View>
                </TouchableOpacity>
                
                <Text className="text-2xl font-bold text-white mt-4">{name}</Text>
                <Text className="text-white/90 font-medium mt-1">
                  {studentID || industryID}
                </Text>
              </View>

              <View className="flex-row justify-around mt-6">
                <View className="items-center">
                  <Text className="text-white text-xl font-bold">4.8</Text>
                  <Text className="text-white/80 text-sm">Rating</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white text-xl font-bold">98%</Text>
                  <Text className="text-white/80 text-sm">Completed</Text>
                </View>
                <View className="items-center">
                  <Text className="text-white text-xl font-bold">A+</Text>
                  <Text className="text-white/80 text-sm">Grade</Text>
                </View>
              </View>
            </LinearGradient>

            <View className="bg-white rounded-3xl p-6 mb-8 shadow-lg">
              <View className="flex-row items-center mb-6">
                <MaterialIcons name="person-outline" size={24} color="#FF3366" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800 text-lg font-medium border-b-2 border-gray-200 pb-2"
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View className="flex-row items-center mb-6">
                <MaterialIcons name="badge-outline" size={24} color="#FF3366" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800 text-lg font-medium border-b-2 border-gray-200 pb-2"
                  placeholder={studentID ? "Student ID" : "Industry ID"}
                  placeholderTextColor="#999"
                  value={studentID || industryID}
                  onChangeText={studentID ? setStudentID : setindustryID}
                />
              </View>

              <View className="flex-row items-center mb-6">
                <MaterialIcons name="school-outline" size={24} color="#FF3366" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800 text-lg font-medium border-b-2 border-gray-200 pb-2"
                  placeholder="Branch"
                  placeholderTextColor="#999"
                  value={branch}
                  onChangeText={setBranch}
                />
              </View>

              <View className="flex-row items-center mb-6">
                <MaterialIcons name="email-outline" size={24} color="#FF3366" />
                <TextInput
                  className="flex-1 ml-3 text-gray-500 text-lg font-medium pb-2"
                  value={email}
                  editable={false}
                />
              </View>

              <View className="flex-row items-center">
                <MaterialIcons name="phone-iphone" size={24} color="#FF3366" />
                <TextInput
                  className="flex-1 ml-3 text-gray-800 text-lg font-medium border-b-2 border-gray-200 pb-2"
                  placeholder="Phone Number"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              className="overflow-hidden rounded-2xl mb-8"
            >
              <LinearGradient
                colors={['#FF7597', '#FF3366']}
                className="py-5 items-center"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text className="text-white text-xl font-bold tracking-wider">
                  Save Changes
                </Text>
                <MaterialIcons 
                  name="arrow-forward" 
                  size={24} 
                  color="white" 
                  className="absolute right-6"
                />
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}