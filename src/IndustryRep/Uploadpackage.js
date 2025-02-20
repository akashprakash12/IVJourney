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
import { Ionicons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const AddPackageScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    packageName: "",
    description: "",
    duration: "",
    price: "",
    activities: ["", "", "", ""],
    inclusions: "",
  });
  const [image, setImage] = useState(null);
  const pickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access gallery is required!");
      return;
    }

    // Open image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"], // Use ImagePicker.MediaType instead of deprecated MediaTypeOptions
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImage(result.assets[0].uri);
    }
  };
 

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("packageName", form.packageName);
      formData.append("description", form.description);
      formData.append("duration", form.duration);
      formData.append("price", form.price);
      formData.append("activities", JSON.stringify(form.activities));
      formData.append("inclusions", form.inclusions);
      console.log(form);
      
  
      if (image) {
        const filename = image.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
  
        formData.append("image", { uri: image, name: filename, type });
      }
      const ip = "192.168.103.90";
      const response = await axios.post( `http://${ip}:5000/api/packages`, formData, {
        
        
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("Success:", response.data);
      alert("Package added successfully!");
      navigation.navigate("Home");
      
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      alert("Failed to add package.");
    }
  };
  

  return (
    <ScrollView className="bg-gray-900 h-full p-4">
      <SafeAreaView className="p-4">
        <TouchableOpacity className="flex-row items-center mb-4">
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="text-xl text-primary_1 font-bold ml-2">Package</Text>
        </TouchableOpacity>

        <Text className="text-lg text-primary_1 font-bold mb-2">
          Add new Package
        </Text>
        <View className="rounded-lg overflow-hidden  mt-5">
          <LinearGradient
            colors={["#FF6480", "#F22E63"]}
            start={[0, 0]}
            end={[1, 0]}
          >
            <View className="p-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white">Package Name</Text>
                <TextInput
                  className="text-white p-0 bg-transparent  w-1/2 border-white mb-5 mt-5"
                  style={styles.textInput}
                  value={form.packageName}
                  onChangeText={(text) =>
                    setForm({ ...form, packageName: text })
                  }
                />
              </View>

              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white">Description</Text>
                <TextInput
                  className="bg-white p-2 rounded-s w-1/2 mb-4 mt-4 h-24 text-start"
                  value={form.description}
                  multiline
                  numberOfLines={4}
                  onChangeText={(text) =>
                    setForm({ ...form, description: text })
                  }
                />
              </View>

              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white">Duration</Text>
                <TextInput
                  className="text-white p-0 bg-transparent  w-1/2 border-white mb-5 mt-5"
                  style={styles.textInput}
                  value={form.duration}
                  onChangeText={(text) => setForm({ ...form, duration: text })}
                />
              </View>

              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white">Price</Text>
                <TextInput
                  className="text-white p-0 bg-transparent  w-1/2 border-white mb-5 mt-5"
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, ""); 
                    setForm({ ...form, price: numericText });
                  }}
                />
              </View>

              <Text className="text-white mt-2">Activity</Text>
              {form.activities.map((activity, index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center mb-2"
                >
                  <Text className="text-white">Day {index + 1}</Text>
                  <TextInput
                    className="text-white p-0 bg-transparent  w-1/2 border-white mb-5 mt-5"
                    style={styles.textInput}
                    value={activity}
                    onChangeText={(text) => {
                      const newActivities = [...form.activities];
                      newActivities[index] = text;
                      setForm({ ...form, activities: newActivities });
                    }}
                  />
                </View>
              ))}

              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white">Package Inclusions</Text>
                <TextInput
                  className="text-white p-0 bg-transparent  w-1/2 border-white mb-5 mt-5"
                  style={styles.textInput}
                  value={form.inclusions}
                  onChangeText={(text) =>
                    setForm({ ...form, inclusions: text })
                  }
                />
              </View>
            </View>
          </LinearGradient>
        </View>
        <View className="rounded-lg overflow-hidden  mt-5">
          <TouchableOpacity
            onPress={pickImage}
            className="rounded-lg overflow-hidden mt-5"
          >
            <LinearGradient
              colors={["#FF6480", "#F22E63"]}
              start={[0, 0]}
              end={[1, 0]}
              className="p-6 rounded-xl"
            >
              <Text className="text-white mb-5 text-center">Upload Image</Text>
              <View className="rounded-lg items-center justify-center border-dashed border-2 border-white h-24">
                <Text className="text-white">Tap to select an image</Text>
                <Text className="text-white text-xs">Max file size: 20MB</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        {image && (
          <Image
            source={{ uri: image }}
            style={{
              width: "100%",
              height: 160,
              marginTop: 16,
              borderRadius: 10,
            }}
          />
        )}
        <View className="items-center" >
          <TouchableOpacity className="rounded-full overflow-hidden w-60 mt-5 "  onPress={handleSubmit} >
            <LinearGradient
              colors={["#FF6480", "#F22E63"]} // pink-500 to purple-500
              start={[0, 0]}
              end={[1, 0]}
              className="py-4 items-center"
            >
              <Text className="text-white font-bold">Submit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    borderBottomWidth: 2, // Set bottom border width
  },
});

export default AddPackageScreen;
