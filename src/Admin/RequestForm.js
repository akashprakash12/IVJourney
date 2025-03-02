import React, { useContext, useEffect, useState } from "react";
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
import { AuthContext } from "../../context/Authcontext";
import { Checkbox } from "react-native-paper";

export default function RequestForm({ navigation }) {
  const { userDetails } = useContext(AuthContext); // Fetch user details from context


  // Auto-filled Student Details (Example: Replace with dynamic data from database)

  const submissionDate = new Date().toLocaleDateString(); // Auto-fill today's date

  const [studentName, setStudentName] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [studentRep, setStudentRep] = useState(""); // Student Representative

  const [industry, setIndustry] = useState("");
  const [date, setDate] = useState(new Date());
  const [studentsCount, setStudentsCount] = useState("");
  const [faculty, setFaculty] = useState("");
  const [transport, setTransport] = useState("");
  const [packageDetails, setPackageDetails] = useState("");
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [ticketCost, setTicketCost] = useState("");
  const [driverPhoneNumber, setDriverPhoneNumber] = useState("");

  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (userDetails) {
      setStudentName(userDetails.fullName);
      setDepartment(userDetails.department || "N/A");
      setStudentRep(
        userDetails.role === "Student Leader" ? userDetails.fullName : ""
      );
    }

    fetchPackages();
  }, [userDetails]); // Run when userDetails changes

  const [checklist, setChecklist] = useState({
    minutesOfMeeting: false,
    studentList: false,
    tourItinerary: false,
    undertaking: false,
    permissionLetter: false,
    permanentFaculty: false,
    ladyFaculty: false,
    educationalTour: false,
    nightJourney: false,
    driverLicense: false,
    vehicleRCBook: false,
    hotelBooking: false,
  });
  const handleChecklistChange = (key) => {
    setChecklist((prevChecklist) => ({
      ...prevChecklist,
      [key]: !prevChecklist[key],
    }));
  };

  // // Handle Form Submission
  const handleSubmit = async () => {
    if (
      !industry ||
      !date ||
      !studentsCount ||
      !faculty ||
      !transport ||
      !packageDetails ||
      !activity ||
      !duration ||
      !distance ||
      !ticketCost ||
      !driverPhoneNumber
    ) {
      Alert.alert("Error", "All fields are required!");
      return;
    }
  
    try {
     
      const requestData = {
        Obj_id:userDetails._id,
        role:userDetails.role,
        email:userDetails.email,
        studentName,
        department,
        studentRep,
        submissionDate,
        industry,
        date,
        studentsCount,
        faculty,
        transport,
        packageDetails,
        activity,
        duration,
        distance: parseFloat(distance),
        ticketCost,
        driverPhoneNumber,
        checklist, // Include checklist data
      };
  
      console.log("Submitting Request:", requestData);
  
      const response = await axios.post(`http://${IP}:5000/api/submit-request`, requestData);
      console.log(response);
      
  
      Alert.alert("Success", "Your request has been submitted!");
    } catch (error) {
      console.error("Error submitting request:", error);
  
      if (error.response) {
        if (error.response.status === 409) {
          Alert.alert("Duplicate Request", "You have already submitted a request for this industry on the same date.");
        } else {
          Alert.alert("Error", error.response.data.error || "Failed to submit request.");
        }
      } else if (error.request) {
        Alert.alert("Error", "No response received from the server. Check your network connection.");
      } else {
        Alert.alert("Error", "Unexpected error occurred.");
      }
    }
  };
  



  const fetchPackages = async () => {
    try {
      const response = await axios.get(`http://${IP}:5000/api/packages`);
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid API response format. Expected an array.");
      }

      const packageData = response.data.map((pkg) => ({
        label: pkg.label, // Use correct keys
        value: pkg.value,
      }));

      setIndustries(packageData); // Update state
    } catch (error) {
      console.error("Error fetching packages:", error);
      Alert.alert("Error", "Failed to load packages.");
    } finally {
      setLoading(false);
    }
  };

  // if (loading) {
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

        {/* Semester (New Field) */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Semester</Text>
        <TextInput
          placeholder="Enter Semester"
          value={semester}
          onChangeText={setSemester}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        <Text className="text-gray-700 font-medium mt-4 mb-1">
          Date of Submission
        </Text>
        <TextInput
          value={submissionDate}
          editable={false}
          className="border border-gray-300 p-3 rounded-lg bg-gray-100 text-gray-600"
        />

<<<<<<< HEAD
        {/* Industry Selection */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Select Package</Text>
=======
        {/* Industry Selection from Packages */}
        {/* Industry Selection from Packages */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">
          Select Package
        </Text>
>>>>>>> 2db38cb95d1b634cb1347c0c22b6bf216cc14e3f
        <RNPickerSelect
          onValueChange={(value) => {
            console.log("Selected Package:", value);
            setIndustry(value);
          }}
          items={industries.length > 0 ? industries : []} // Prevent errors
          placeholder={{
            label: loading ? "Loading packages..." : "Choose a Package...",
            value: null,
          }}
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
        <Text className="text-gray-700 font-medium mt-4 mb-1">
          Number of Students
        </Text>
        <TextInput
          placeholder="Enter number"
          keyboardType="numeric"
          value={studentsCount}
          onChangeText={setStudentsCount}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Faculty */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">
          Accompanying Faculty
        </Text>
        <RNPickerSelect
          onValueChange={(value) => setFaculty(value)}
          items={[
            { label: "Dr. Sharma", value: "Dr. Sharma" },
            { label: "Prof. Mehta", value: "Prof. Mehta" },
          ]}
          placeholder={{ label: "Select Faculty...", value: null }}
        />

        {/* Transport */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">
          Mode of Transport
        </Text>
        <RNPickerSelect
          onValueChange={(value) => setTransport(value)}
          items={[
            { label: "College Bus", value: "College Bus" },
            { label: "Private Transport", value: "Private Transport" },
          ]}
          placeholder={{ label: "Select Transport Mode...", value: null }}
        />

        {/* Package Details */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">
          Package Details
        </Text>
        <TextInput
          placeholder="Describe package"
          value={packageDetails}
          onChangeText={setPackageDetails}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Activity */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">
          Activity Plan
        </Text>
        <TextInput
          placeholder="Brief about planned activities"
          value={activity}
          onChangeText={setActivity}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Duration */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">
          Duration (in days)
        </Text>
        <TextInput
          placeholder="e.g., 2 days"
          value={duration}
          onChangeText={setDuration}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Distance */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">
          Distance (in km)
        </Text>
        <TextInput
          placeholder="e.g., 100 km"
          keyboardType="numeric"
          value={distance}
          onChangeText={setDistance}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />

        {/* Travel Ticket Cost */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">
          Travel Ticket Cost
        </Text>
        <TextInput
          placeholder="Enter cost"
          keyboardType="numeric"
          value={ticketCost}
          onChangeText={setTicketCost}
          className="border border-gray-300 p-3 rounded-lg bg-gray-50"
        />
        <Text className="text-gray-700 font-medium mt-4 mb-1">Checklist</Text>
        {Object.entries(checklist).map(([key, value]) => (
          <View key={key} className="flex-row items-center mb-2">
            <Checkbox
              status={value ? "checked" : "unchecked"}
              onPress={() => handleChecklistChange(key)}
            />
            <Text className="ml-2 capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </Text>
          </View>
        ))}

        {/* Driver Phone Number (New Field) */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">
          Driver Phone Number
        </Text>
        <TextInput
          placeholder="Enter Driver's Contact"
          keyboardType="phone-pad"
          value={driverPhoneNumber}
          onChangeText={setDriverPhoneNumber}
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
              <Text className="text-white font-bold text-lg">
                Submit Request
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
