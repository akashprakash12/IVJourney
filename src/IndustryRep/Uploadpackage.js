import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { IP } from "@env";
import axios from "axios";

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
      Alert.alert("Permission required to access media library");
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

      // Add Day X: prefix to each activity
      const activitiesWithDay = form.activities.map(
        (activity, index) => `Day ${index + 1}: ${activity}`
      );

      formData.append("packageName", form.packageName);
      formData.append("description", form.description);
      formData.append("duration", form.duration);
      formData.append("price", form.price.toString());
      formData.append("activities", JSON.stringify(activitiesWithDay)); // Add prefixed activities
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
       Alert.alert("Package added successfully!");
        navigation.navigate("Home");
      } else {
       Alert.alert(`Failed to add package: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("An error occurred while adding the package.");
    }
  };
  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="p-6">
        <SafeAreaView>
          <Text className="text-2xl font-bold text-gray-800 mb-4">
            Add New Package
          </Text>

          <View className="bg-white p-6 rounded-xl shadow-md">
            <Text className="text-gray-700 mb-2 font-bold">Package Name</Text>
            <TextInput
              className="border p-2 rounded-lg mb-4"
              value={form.packageName}
              onChangeText={(text) => setForm({ ...form, packageName: text })}
            />

            <Text className="text-gray-700 mb-2 font-bold">Description</Text>
            <TextInput
              className="border p-2 rounded-lg mb-4"
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              multiline
            />

            <Text className="text-gray-700 mb-2 font-bold">Duration</Text>
            <TextInput
              className="border p-2 rounded-lg mb-4"
              value={form.duration}
              onChangeText={(text) => setForm({ ...form, duration: text })}
            />

            <Text className="text-gray-700 mb-2 font-bold">Price</Text>
            <TextInput
              className="border p-2 rounded-lg mb-4"
              keyboardType="numeric"
              value={form.price}
              onChangeText={(text) =>
                setForm({ ...form, price: text.replace(/[^0-9]/g, "") })
              }
            />

            <Text className="text-gray-700 mb-2 font-bold">Activities</Text>
            {form.activities.map((activity, index) => (
  <View key={index} className="mb-2">
    <Text className="text-gray-700 mb-1">Day {index + 1}</Text>
    <View className="flex-row items-center">
      <TextInput
        className="border p-2 rounded-lg flex-1"
        value={activity}
        placeholder="Enter activity"
        onChangeText={(text) => {
          const newActivities = [...form.activities];
          newActivities[index] = text; // Save the activity without prefix
          setForm({ ...form, activities: newActivities });
        }}
      />
      <TouchableOpacity
        onPress={() => removeActivityField(index)}
        className="ml-2 p-2 bg-red-500 rounded-lg"
      >
        <Ionicons name="trash" size={20} color="white" />
      </TouchableOpacity>
    </View>
  </View>
))}
            <TouchableOpacity
              onPress={addActivityField}
              className="flex-row items-center p-2 bg-blue-500 rounded-lg mb-4"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white ml-2">Add Activity</Text>
            </TouchableOpacity>

            <Text className="text-gray-700 mb-2 font-bold">Inclusions</Text>
            <TextInput
              className="border p-2 rounded-lg mb-4"
              value={form.inclusions}
              onChangeText={(text) => setForm({ ...form, inclusions: text })}
            />

            <Text className="text-gray-700 mb-2 font-bold">Instructions</Text>
            <TextInput
              className="border p-2 rounded-lg mb-4"
              value={form.instructions}
              onChangeText={(text) => setForm({ ...form, instructions: text })}
            />

            <Text className="text-gray-700 mb-2 font-bold">Upload Image</Text>
            <TouchableOpacity
              onPress={pickImage}
              className="border p-2 rounded-lg bg-gray-200 mb-4 items-center"
            >
              <Text>Select Image</Text>
            </TouchableOpacity>
            {form.image && (
              <Image
                source={{ uri: form.image }}
                className="w-full h-40 rounded-lg mb-4"
              />
            )}
          </View>
        </SafeAreaView>
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-green-500 p-4 rounded-lg mt-4"
        >
          <Text className="text-white text-center font-bold">Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddPackageScreen;
