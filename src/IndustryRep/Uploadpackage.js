import React, { useState, useEffect } from "react";
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
import { Picker } from "@react-native-picker/picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { IP } from "@env";
import axios from "axios";
import packageData from "../../assets/db.json";
import FormData from 'form-data';

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
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    if (packageData && packageData.length > 0) {
      setLoading(false);
    }
  }, []);

  const handlePackageSelection = (packageName) => {
    const selected = packageData.find((pkg) => pkg.packageName === packageName);
    if (selected) {
      setSelectedPackage(selected);
      setForm({
        packageName: selected.packageName,
        description: selected.description,
        duration: selected.duration,
        price: selected.price.toString(),
        activities: selected.activities,
        inclusions: selected.inclusions,
        instructions: selected.instructions,
        image: selected.image,
      });
    }
  };

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
      const activitiesWithDay = form.activities.map(
        (activity, index) => `Day ${index + 1}: ${activity}`
      );

      formData.append("packageName", form.packageName);
      formData.append("description", form.description);
      formData.append("duration", form.duration);
      formData.append("price", form.price.toString());
      formData.append("activities", JSON.stringify(activitiesWithDay));
      formData.append("inclusions", form.inclusions);
      formData.append("instructions", form.instructions);

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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-700">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="p-6">
        <SafeAreaView>
          <Text className="text-3xl font-bold text-gray-900 mb-6">
            Add New Package
          </Text>

          {/* Package Selection Dropdown */}
          <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
            <Text className="text-gray-700 mb-2 font-semibold">Select Package</Text>
            <Picker
              selectedValue={selectedPackage ? selectedPackage.packageName : ""}
              onValueChange={(itemValue) => handlePackageSelection(itemValue)}
              style={{ backgroundColor: "#f9fafb", borderRadius: 8 }}
            >
              <Picker.Item label="Select a package" value="" />
              {packageData.map((pkg) => (
                <Picker.Item
                  key={pkg.packageName}
                  label={pkg.packageName}
                  value={pkg.packageName}
                />
              ))}
            </Picker>
          </View>

          {/* Form Fields */}
          <View className="bg-white p-6 rounded-xl shadow-sm">
            <Text className="text-gray-700 mb-2 font-semibold">Package Name</Text>
            <TextInput
              className="border border-gray-200 p-3 rounded-lg mb-4 bg-gray-50"
              value={form.packageName}
              onChangeText={(text) => setForm({ ...form, packageName: text })}
              placeholder="Enter package name"
            />

            <Text className="text-gray-700 mb-2 font-semibold">Description</Text>
            <TextInput
              className="border border-gray-200 p-3 rounded-lg mb-4 bg-gray-50"
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              placeholder="Enter description"
              multiline
            />

            <Text className="text-gray-700 mb-2 font-semibold">Duration</Text>
            <TextInput
              className="border border-gray-200 p-3 rounded-lg mb-4 bg-gray-50"
              value={form.duration}
              onChangeText={(text) => setForm({ ...form, duration: text })}
              placeholder="Enter duration"
            />

            <Text className="text-gray-700 mb-2 font-semibold">Price</Text>
            <TextInput
              className="border border-gray-200 p-3 rounded-lg mb-4 bg-gray-50"
              keyboardType="numeric"
              value={form.price}
              onChangeText={(text) =>
                setForm({ ...form, price: text.replace(/[^0-9]/g, "") })
              }
              placeholder="Enter price"
            />

            <Text className="text-gray-700 mb-2 font-semibold">Activities</Text>
            {form.activities.map((activity, index) => (
              <View key={index} className="mb-3">
                <Text className="text-gray-700 mb-1">Day {index + 1}</Text>
                <View className="flex-row items-center">
                  <TextInput
                    className="border border-gray-200 p-3 rounded-lg flex-1 bg-gray-50"
                    value={activity}
                    placeholder="Enter activity"
                    onChangeText={(text) => {
                      const newActivities = [...form.activities];
                      newActivities[index] = text;
                      setForm({ ...form, activities: newActivities });
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => removeActivityField(index)}
                    className="ml-2 p-3 bg-red-500 rounded-lg"
                  >
                    <Ionicons name="trash" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={addActivityField}
              className="flex-row items-center p-3 bg-blue-500 rounded-lg mb-4"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white ml-2">Add Activity</Text>
            </TouchableOpacity>

            <Text className="text-gray-700 mb-2 font-semibold">Inclusions</Text>
            <TextInput
              className="border border-gray-200 p-3 rounded-lg mb-4 bg-gray-50"
              value={form.inclusions}
              onChangeText={(text) => setForm({ ...form, inclusions: text })}
              placeholder="Enter inclusions"
            />

            <Text className="text-gray-700 mb-2 font-semibold">Instructions</Text>
            <TextInput
              className="border border-gray-200 p-3 rounded-lg mb-4 bg-gray-50"
              value={form.instructions}
              onChangeText={(text) => setForm({ ...form, instructions: text })}
              placeholder="Enter instructions"
            />

            <Text className="text-gray-700 mb-2 font-semibold">Upload Image</Text>
            <TouchableOpacity
              onPress={pickImage}
              className="border border-gray-200 p-3 rounded-lg bg-gray-50 mb-4 items-center"
            >
              <Text className="text-gray-700">Select Image</Text>
            </TouchableOpacity>
            {form.image && (
              <Image
                source={{ uri: form.image }}
                className="w-full h-48 rounded-lg mb-4"
              />
            )}
          </View>
        </SafeAreaView>
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-green-500 p-4 rounded-lg mt-6 mb-9"
        >
          <Text className="text-white text-center font-bold">Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddPackageScreen;