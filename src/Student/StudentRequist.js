import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function UndertakingForm({ navigation }) {
  const [studentName, setStudentName] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [className, setClassName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [localGuardianPhone, setLocalGuardianPhone] = useState("");
  const [tourPurpose, setTourPurpose] = useState("");
  const [placesVisited, setPlacesVisited] = useState("");
  const [tourPeriod, setTourPeriod] = useState("");
  const [facultyDetails, setFacultyDetails] = useState("");
  const [studentSignature, setStudentSignature] = useState("");
  const [parentSignature, setParentSignature] = useState("");

  const handleSubmit = () => {
    if (
      !studentName ||
      !semester ||
      !branch ||
      !className ||
      !rollNo ||
      !admissionNo ||
      !residentialAddress ||
      !studentPhone ||
      !parentName ||
      !localGuardianPhone ||
      !tourPurpose ||
      !placesVisited ||
      !tourPeriod ||
      !facultyDetails ||
      !studentSignature ||
      !parentSignature
    ) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    const formData = {
      studentName,
      semester,
      branch,
      className,
      rollNo,
      admissionNo,
      residentialAddress,
      studentPhone,
      parentName,
      localGuardianPhone,
      tourPurpose,
      placesVisited,
      tourPeriod,
      facultyDetails,
      studentSignature,
      parentSignature,
    };

    console.log("Submitting Undertaking Form:", formData);
    Alert.alert("Success", "Your undertaking form has been submitted!");
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-5">
      <Text className="text-3xl font-bold text-center text-pink-600 mb-5">
        Undertaking Form ✍️
      </Text>

      <View className="bg-white p-5 rounded-2xl shadow-md">
        {/* Student Name */}
        <Text className="text-gray-700 font-medium mb-1">Student Name</Text>
        <TextInput
          placeholder="Enter Student Name"
          value={studentName}
          onChangeText={setStudentName}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Semester, Branch, Class, Roll No., Admission No. */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Semester</Text>
        <TextInput
          placeholder="Enter Semester"
          value={semester}
          onChangeText={setSemester}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        <Text className="text-gray-700 font-medium mt-4 mb-1">Branch</Text>
        <TextInput
          placeholder="Enter Branch"
          value={branch}
          onChangeText={setBranch}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        <Text className="text-gray-700 font-medium mt-4 mb-1">Class</Text>
        <TextInput
          placeholder="Enter Class"
          value={className}
          onChangeText={setClassName}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        <Text className="text-gray-700 font-medium mt-4 mb-1">Roll No.</Text>
        <TextInput
          placeholder="Enter Roll No."
          value={rollNo}
          onChangeText={setRollNo}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        <Text className="text-gray-700 font-medium mt-4 mb-1">Admission No.</Text>
        <TextInput
          placeholder="Enter Admission No."
          value={admissionNo}
          onChangeText={setAdmissionNo}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Residential Address */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Residential Address</Text>
        <TextInput
          placeholder="Enter Address"
          value={residentialAddress}
          onChangeText={setResidentialAddress}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
          multiline
        />

        {/* Parent & Local Guardian */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Parent's Name</Text>
        <TextInput
          placeholder="Enter Parent's Name"
          value={parentName}
          onChangeText={setParentName}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        <Text className="text-gray-700 font-medium mt-4 mb-1">
          Local Guardian's Phone No.
        </Text>
        <TextInput
          placeholder="Enter Phone Number"
          keyboardType="phone-pad"
          value={localGuardianPhone}
          onChangeText={setLocalGuardianPhone}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Purpose of Tour */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Purpose of Tour</Text>
        <TextInput
          placeholder="Enter Purpose"
          value={tourPurpose}
          onChangeText={setTourPurpose}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Places to Visit */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Places to Visit</Text>
        <TextInput
          placeholder="Enter Places"
          value={placesVisited}
          onChangeText={setPlacesVisited}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Tour Period */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Tour Period</Text>
        <TextInput
          placeholder="Enter Tour Period (Date & Time)"
          value={tourPeriod}
          onChangeText={setTourPeriod}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Faculty Details */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Accompanying Faculty</Text>
        <TextInput
          placeholder="Enter Faculty Details"
          value={facultyDetails}
          onChangeText={setFacultyDetails}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Signatures */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Student Signature</Text>
        <TextInput
          placeholder="Enter Signature"
          value={studentSignature}
          onChangeText={setStudentSignature}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        <Text className="text-gray-700 font-medium mt-4 mb-1">Parent Signature</Text>
        <TextInput
          placeholder="Enter Signature"
          value={parentSignature}
          onChangeText={setParentSignature}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Submit Button */}
        <TouchableOpacity onPress={handleSubmit} className="mt-6">
          <LinearGradient colors={["#FF6480", "#F22E63"]} className="p-4 rounded-full items-center">
            <Text className="text-white font-bold text-lg">Submit Form</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
