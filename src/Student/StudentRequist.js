import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";

export default function UndertakingForm() {
  const [studentName, setStudentName] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [parentName, setParentName] = useState("");
  const [placesVisited, setPlacesVisited] = useState("");
  const [tourPeriod, setTourPeriod] = useState("");
  const [facultyDetails, setFacultyDetails] = useState("");
  const [studentSignature, setStudentSignature] = useState(null);
  const [parentSignature, setParentSignature] = useState(null);

  // Function to handle signature upload
  const pickSignature = async (setSignature) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 2], // Signature aspect ratio
      quality: 1,
    });

    if (!result.canceled) {
      setSignature(result.assets[0].uri);
    }
  };

  // Handle Form Submission
  const handleSubmit = () => {
    if (
      !studentName ||
      !semester ||
      !branch ||
      !rollNo ||
      !parentName ||
      !placesVisited ||
      !tourPeriod ||
      !facultyDetails ||
      !studentSignature ||
      !parentSignature
    ) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    Alert.alert("Success", "Your undertaking form has been submitted!");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
        keyboardShouldPersistTaps="handled"
      >
       

        <View style={{ backgroundColor: "white", padding: 15, borderRadius: 10, elevation: 3 }}>
          {/* Student Details */}
          <Text style={styles.label}>Student Name</Text>
          <TextInput style={styles.input} placeholder="Enter Student Name" value={studentName} onChangeText={setStudentName} />

          <Text style={styles.label}>Semester</Text>
          <TextInput style={styles.input} placeholder="Enter Semester" value={semester} onChangeText={setSemester} />

          <Text style={styles.label}>Branch</Text>
          <TextInput style={styles.input} placeholder="Enter Branch" value={branch} onChangeText={setBranch} />

          <Text style={styles.label}>Roll No.</Text>
          <TextInput style={styles.input} placeholder="Enter Roll No." value={rollNo} onChangeText={setRollNo} />

          <Text style={styles.label}>Parent's Name</Text>
          <TextInput style={styles.input} placeholder="Enter Parent's Name" value={parentName} onChangeText={setParentName} />

          <Text style={styles.label}>Places to Visit</Text>
          <TextInput style={styles.input} placeholder="Enter Places" value={placesVisited} onChangeText={setPlacesVisited} />

          <Text style={styles.label}>Tour Period</Text>
          <TextInput style={styles.input} placeholder="Enter Tour Period (Date & Time)" value={tourPeriod} onChangeText={setTourPeriod} />

          <Text style={styles.label}>Accompanying Faculty</Text>
          <TextInput style={styles.input} placeholder="Enter Faculty Details" value={facultyDetails} onChangeText={setFacultyDetails} />

          {/* Student Signature Upload */}
          <Text style={styles.label}>Upload Student Signature</Text>
          <TouchableOpacity onPress={() => pickSignature(setStudentSignature)} style={styles.uploadButton}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Upload Signature</Text>
          </TouchableOpacity>

          {/* Show Student Signature Preview */}
          {studentSignature && <Image source={{ uri: studentSignature }} style={styles.signaturePreview} />}

          {/* Parent Signature Upload */}
          <Text style={styles.label}>Upload Parent Signature</Text>
          <TouchableOpacity onPress={() => pickSignature(setParentSignature)} style={styles.uploadButton}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Upload Signature</Text>
          </TouchableOpacity>

          {/* Show Parent Signature Preview */}
          {parentSignature && <Image source={{ uri: parentSignature }} style={styles.signaturePreview} />}

          {/* Submit Button */}
          <TouchableOpacity onPress={handleSubmit} style={{ marginTop: 20 }}>
            <LinearGradient colors={["#FF6480", "#F22E63"]} style={styles.button}>
              <Text style={{ color: "white", fontWeight: "bold" }}>Submit Form</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles
const styles = {
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#F9F9F9",
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: "#F22E63",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  signaturePreview: {
    width: 200,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
};
