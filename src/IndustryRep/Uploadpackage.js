import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { IP } from "@env";

const AddPackageScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    packageName: "",
    description: "",
    duration: "",
    price: "",
    activities: [""],
    inclusions: "",
    instructions: "",
    image: null,
  });
console.log(form);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission required to access media library");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setForm({ ...form, image: result.assets[0].uri });
    }
  };

  const addActivityField = () => {
    setForm({ ...form, activities: [...form.activities, ""] });
  };

  const removeActivityField = (index) => {
    const newActivities = [...form.activities];
    newActivities.splice(index, 1);
    setForm({ ...form, activities: newActivities });
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("packageName", form.packageName);
      formData.append("description", form.description);
      formData.append("duration", form.duration);
      formData.append("price", form.price.toString()); // Ensure price is sent as a string
      formData.append("activities", JSON.stringify(form.activities)); // Convert activities to JSON string
      formData.append("inclusions", form.inclusions);
      formData.append("instructions", form.instructions);
  
      // Handle image upload
      if (form.image) {
        const filename = form.image.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
  
        formData.append("image", {
          uri: form.image,
          name: filename,
          type: type,
        });
      }
  
      const response = await axios.post(
        `http://${IP}:5000/api/packages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.status === 201) {
        alert("Package added successfully!");
        navigation.navigate("Home");
      } else {
        alert(`Failed to add package: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the package.");
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="p-6">
        <SafeAreaView>
          <Text className="text-2xl font-bold text-gray-800 mb-4">Add New Package</Text>

          <View className="bg-white p-6 rounded-xl shadow-md">
            <Text className="text-gray-700 mb-2 font-bold">Package Name</Text>
            <TextInput className="border p-2 rounded-lg mb-4" value={form.packageName} onChangeText={(text) => setForm({ ...form, packageName: text })} />

            <Text className="text-gray-700 mb-2 font-bold">Description</Text>
            <TextInput className="border p-2 rounded-lg mb-4" value={form.description} onChangeText={(text) => setForm({ ...form, description: text })} multiline />

            <Text className="text-gray-700 mb-2 font-bold">Duration</Text>
            <TextInput className="border p-2 rounded-lg mb-4" value={form.duration} onChangeText={(text) => setForm({ ...form, duration: text })} />

            <Text className="text-gray-700 mb-2 font-bold">Price</Text>
            <TextInput className="border p-2 rounded-lg mb-4" keyboardType="numeric" value={form.price} onChangeText={(text) => setForm({ ...form, price: text.replace(/[^0-9]/g, "") })} />

            <Text className="text-gray-700 mb-2 font-bold">Activities</Text>
            {form.activities.map((activity, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <TextInput
                  className="border p-2 rounded-lg flex-1"
                  value={activity}
                  placeholder={`Day ${index + 1} Activity`}
                  onChangeText={(text) => {
                    const newActivities = [...form.activities];
                    newActivities[index] = text;
                    setForm({ ...form, activities: newActivities });
                  }}
                />
                <TouchableOpacity onPress={() => removeActivityField(index)} className="ml-2 p-2 bg-red-500 rounded-lg">
                  <Ionicons name="trash" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={addActivityField} className="flex-row items-center p-2 bg-blue-500 rounded-lg mb-4">
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white ml-2">Add Activity</Text>
            </TouchableOpacity>

            <Text className="text-gray-700 mb-2 font-bold">Inclusions</Text>
            <TextInput className="border p-2 rounded-lg mb-4" value={form.inclusions} onChangeText={(text) => setForm({ ...form, inclusions: text })} />

            <Text className="text-gray-700 mb-2 font-bold">Instructions</Text>
            <TextInput className="border p-2 rounded-lg mb-4" value={form.instructions} onChangeText={(text) => setForm({ ...form, instructions: text })} />

            <Text className="text-gray-700 mb-2 font-bold">Upload Image</Text>
            <TouchableOpacity onPress={pickImage} className="border p-2 rounded-lg bg-gray-200 mb-4 items-center">
              <Text>Select Image</Text>
            </TouchableOpacity>
            {form.image && <Image source={{ uri: form.image }} className="w-full h-40 rounded-lg mb-4" />}
          </View>
        </SafeAreaView>
        <TouchableOpacity onPress={() => alert("Package Submitted")} className="bg-green-500 p-4 rounded-lg mt-4">
          <Text className="text-white text-center font-bold">Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddPackageScreen;
