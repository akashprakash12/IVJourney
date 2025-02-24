import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import RNPickerSelect from "react-native-picker-select";
import axios from "axios"; // Import Axios for API calls
import { IP } from "@env";
export default function RequestForm({ navigation }) {
  // Auto-filled Student Details (Example: Replace with dynamic data from database)
 
  const submissionDate = new Date().toLocaleDateString(); // Auto-fill today's date

  const [studentName, setStudentName] = useState("");
  const [department, setDepartment] = useState("");
  const [studentRep, setStudentRep] = useState(""); // Student Representative
  const [industry, setIndustry] = useState("");
  const [date, setDate] = useState("");
  const [studentsCount, setStudentsCount] = useState("");
  const [faculty, setFaculty] = useState("");
  const [transport, setTransport] = useState("");
  const [packageDetails, setPackageDetails] = useState("");
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [ticketCost, setTicketCost] = useState("");
  const [loading, setLoading] = useState(true);


    // Fetch Student Details from the Database
    useEffect(() => {
      const fetchStudentDetails = async () => {
        try {
          const response = await axios.get(`http://${IP}/api/student-details`, {
            params: { studentID: "STU-63844" }, // Replace with actual student ID
          });
  
          const student = response.data;
          setStudentName(student.fullName);
          setDepartment(student.department);
          setStudentRep(student.studentRep); // Set Student Representative
          setLoading(false);
        } catch (error) {
          console.error("Error fetching student details:", error);
          Alert.alert("Error", "Failed to fetch student details.");
          setLoading(false);
        }
      };
  
      fetchStudentDetails();
    }, []);
  // Handle Form Submission
  const handleSubmit = async () => {
    if (!industry || !date || !studentsCount || !faculty || !transport || !packageDetails || !activity || !duration || !distance || !ticketCost) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    try {
      const requestData = {
        studentName,
        department,
        studentRep, // Include Student Rep
        submissionDate,
        industry,
        date,
        studentsCount,
        faculty,
        transport,
        packageDetails,
        activity,
        duration,
        distance,
        ticketCost,
      };

      await axios.post(`http://${IP}/api/submit-request`, requestData);
      Alert.alert("Success", "Your request has been submitted!");

      navigation.navigate("PDFPreview", requestData);
    } catch (error) {
      console.error("Error submitting request:", error);
      Alert.alert("Error", "Failed to submit request.");
    }
  };

  // if (!loading) {
  //   return (
  //     <View className="flex-1 justify-center items-center">
  //       <ActivityIndicator size="large" color="#F22E63" />
  //     </View>
  //   );
  // }

  return (
    <ScrollView className="flex-1 bg-gray-100 p-5">
      <Text className="text-3xl font-bold text-center text-pink-600 mb-5">
        Industrial Visit Request 🚀
      </Text>

      <View className="bg-white p-5 rounded-2xl shadow-md">
        {/* Auto-Filled Student Details */}
        <Text className="text-gray-700 font-medium mb-1">Student Name</Text>
        <TextInput
          value={studentName}
          editable={false}
          className="border border-gray-300 p-3 rounded-lg bg-gray-100 text-gray-600"
        />

        <Text className="text-gray-700 font-medium mt-4 mb-1">Department</Text>
        <TextInput
          value={department}
          editable={false}
          className="border border-gray-300 p-3 rounded-lg bg-gray-100 text-gray-600"
        />

        <Text className="text-gray-700 font-medium mt-4 mb-1">Date of Submission</Text>
        <TextInput
          value={submissionDate}
          editable={false}
          className="border border-gray-300 p-3 rounded-lg bg-gray-100 text-gray-600"
        />

        {/* Industry Selection */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Select Industry</Text>
        <RNPickerSelect
          onValueChange={(value) => setIndustry(value)}
          items={[
            { label: "Infosys", value: "Infosys" },
            { label: "TCS", value: "TCS" },
            { label: "Wipro", value: "Wipro" },
          ]}
          placeholder={{ label: "Choose an Industry...", value: null }}
        />

        {/* Visit Date */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Visit Date</Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* No. of Students */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Number of Students</Text>
        <TextInput
          placeholder="Enter number"
          keyboardType="numeric"
          value={studentsCount}
          onChangeText={setStudentsCount}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Faculty */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Accompanying Faculty</Text>
        <RNPickerSelect
          onValueChange={(value) => setFaculty(value)}
          items={[
            { label: "Dr. Sharma", value: "Dr. Sharma" },
            { label: "Prof. Mehta", value: "Prof. Mehta" },
          ]}
          placeholder={{ label: "Select Faculty...", value: null }}
        />

        {/* Transport */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Mode of Transport</Text>
        <RNPickerSelect
          onValueChange={(value) => setTransport(value)}
          items={[
            { label: "College Bus", value: "College Bus" },
            { label: "Private Transport", value: "Private Transport" },
          ]}
          placeholder={{ label: "Select Transport Mode...", value: null }}
        />

        {/* Package Details */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Package Details</Text>
        <TextInput
          placeholder="Describe package"
          value={packageDetails}
          onChangeText={setPackageDetails}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Activity */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Activity Plan</Text>
        <TextInput
          placeholder="Brief about planned activities"
          value={activity}
          onChangeText={setActivity}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Duration */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Duration (in days)</Text>
        <TextInput
          placeholder="e.g., 2 days"
          value={duration}
          onChangeText={setDuration}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Distance */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Distance (in km)</Text>
        <TextInput
          placeholder="e.g., 100 km"
          keyboardType="numeric"
          value={distance}
          onChangeText={setDistance}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Travel Ticket Cost */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Travel Ticket Cost</Text>
        <TextInput
          placeholder="Enter cost"
          keyboardType="numeric"
          value={ticketCost}
          onChangeText={setTicketCost}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Submit Button */}
        <View className="items-center mt-6">
          <TouchableOpacity
            className="w-3/4 rounded-full overflow-hidden"
            onPress={handleSubmit}
          >
            <LinearGradient
              colors={["#FF6480", "#F22E63"]}
              start={[0, 0]}
              end={[1, 0]}
              className="p-4 items-center rounded-full"
            >
              <Text className="text-white font-bold text-lg">Submit Request</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
