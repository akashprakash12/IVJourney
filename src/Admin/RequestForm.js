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
    const fetchProfile = async () => {
      try {
        if (userDetails?.email) {
          const response = await axios.get(
            `http://${IP}:5000/api/getProfile/${userDetails.email}`
          );
          // Set the department/branch from the profile
          console.log(response.data);
          setSemester(response.data.semester)
          setStudentName(response.data.name)
          setDepartment(response.data.branch || "N/A");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setDepartment("N/A");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
    fetchPackages()  }, [userDetails?.email]);

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
    try {
      console.log(userDetails);
      
      const checkResponse = await axios.get(
        `http://${IP}:5000/api/check-request/${userDetails._id}`
      );
      
      console.log("Check response:", checkResponse.data);
      if (checkResponse.data.exists) {
        Alert.alert(
          "Request Exists",
          "You have already submitted a request. Only one request is allowed per student.",
        
        );
        return;
      }
      // Validate all required fields
      const requiredFields = [
        { name: 'industry', value: industry, label: 'Industry/Package selection' },
        { name: 'date', value: date, label: 'Visit date' },
        { name: 'studentsCount', value: studentsCount, label: 'Number of students' },
        { name: 'faculty', value: faculty, label: 'Accompanying faculty' },
        { name: 'transport', value: transport, label: 'Transport mode' },
        { name: 'packageDetails', value: packageDetails, label: 'Package details' },
        { name: 'activity', value: activity, label: 'Activity plan' },
        { name: 'duration', value: duration, label: 'Duration' },
        { name: 'distance', value: distance, label: 'Distance' },
        { name: 'ticketCost', value: ticketCost, label: 'Ticket cost' },
        { name: 'driverPhoneNumber', value: driverPhoneNumber, label: 'Driver phone number' }
      ];
  
      // Check for missing or empty fields
      const missingFields = requiredFields
        .filter(field => {
          // Trim string values before checking if empty
          const value = typeof field.value === 'string' ? field.value.trim() : field.value;
          return value === undefined || value === null || value === '';
        })
        .map(field => field.label);
  
      if (missingFields.length > 0) {
        Alert.alert(
          "Missing Information",
          `Please fill in: ${missingFields.join(", ")}`
        );
        return;
      }
  
      // Additional validations
      const validationErrors = [];
      
      if (isNaN(parseInt(studentsCount)) || parseInt(studentsCount) <= 0) {
        validationErrors.push("Please enter a valid number of students (must be positive)");
      }
  
      if (isNaN(parseFloat(distance))) {
        validationErrors.push("Please enter a valid distance");
      }
  
      if (isNaN(parseFloat(ticketCost))) {
        validationErrors.push("Please enter a valid ticket cost");
      }
  
      if (!/^\d{10}$/.test(driverPhoneNumber)) {
        validationErrors.push("Please enter a valid 10-digit phone number");
      }
  
      // Validate date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      if (selectedDate < today) {
        validationErrors.push("Visit date cannot be in the past");
      }
  
      if (validationErrors.length > 0) {
        Alert.alert(
          "Validation Error",
          validationErrors.join("\n\n")
        );
        return;
      }
  
      // Prepare data with proper types and trimmed strings
      const requestData = {
        Obj_id: userDetails._id,
        role: userDetails.role,
        email: userDetails.email.trim().toLowerCase(),
        studentName: studentName.trim(),
        department: department,
        semester: semester,
        studentRep: studentRep ? studentRep.trim() : "Not specified",
        submissionDate: new Date().toISOString(),
        industry: industry.trim(),
        date: new Date(date).toISOString(),
        studentsCount: parseInt(studentsCount),
        faculty: faculty,
        transport: transport,
        packageDetails: packageDetails,
        activity: activity,
        duration: duration,
        distance: parseFloat(distance),
        ticketCost: parseFloat(ticketCost),
        driverPhoneNumber: driverPhoneNumber,
        checklist: checklist
      };
  
    
      // Add timeout to the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
  console.log(requestData);
  
      const response = await axios.post(
        `http://${IP}:5000/api/submit-request`,
        requestData,
        { signal: controller.signal }
      );
  
      clearTimeout(timeoutId);
  
      if (response.data && response.data.success) {
        Alert.alert("Success", "Request submitted successfully!");
        // Consider resetting form or navigating away here
      } else {
        throw new Error("Unexpected response from server");
      }
      
    } catch (error) {
      console.error("Submission error:", error);
      
      let errorMessage = "Failed to submit request. Please try again later.";
      
      if (error.name === 'AbortError') {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = "Invalid data submitted. Please check your inputs.";
            break;
          case 401:
            errorMessage = "Authentication failed. Please login again.";
            break;
          case 403:
            errorMessage = "You don't have permission to perform this action.";
            break;
          case 409:
            errorMessage = "You've already submitted a similar request.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = error.response.data?.error || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      }
  
      Alert.alert(
        "Error",
        errorMessage,
        error.response?.status === 401 ? 
          [{ text: "OK", onPress: () => navigation.navigate('Login') }]
          : undefined
      );
    } finally {
      // Any cleanup code can go here
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`http://${IP}:5000/api/packages`);
 
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid API response format. Expected an array.");
      }
  
      // Sort packages by votes in descending order
      const sortedPackages = response.data.sort((a, b) => b.votes - a.votes);
  
      // Get the most voted package
      const mostVotedPackage = sortedPackages[0];
  
      if (mostVotedPackage) {
    
        // ✅ Auto-fill form fields
        setIndustry(mostVotedPackage.packageName);
        setPackageDetails(mostVotedPackage.description);
        setActivity(mostVotedPackage.activities.join("\n")); // Format activities as multiline text
        setDuration(mostVotedPackage.duration);
        setTicketCost(mostVotedPackage.price.toString()); // Convert price to string
  
        // Fetch the total number of students who voted for this package
        const response = await axios.get(`http://${IP}:5000/api/votes-details`);
        const { totalStudents } = response.data;
    
        const totalVotes = totalStudents;
  
        // Auto-fill the number of students field
        setStudentsCount(totalVotes.toString());
      } else {
        console.log("No packages available.");
      }
  
      // Map data for industry selection dropdown
      const packageData = response.data.map((pkg) => ({
        label: pkg.packageName,
        value: pkg.packageName,
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
          onChangeText={setStudentName}
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

        {/* Industry Selection */}
        <Text className="text-gray-700 font-medium mt-4 mb-1">Select Package</Text>
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
