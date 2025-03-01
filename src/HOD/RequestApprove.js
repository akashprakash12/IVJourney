import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker"; 
import { WebView } from "react-native-webview";
import { printToFileAsync } from "expo-print";
import axios from "axios";
import { IP } from "@env";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";

export default function PDFPreview() {
  const [pdfUri, setPdfUri] = useState(null); // PDF File URI
  const [pdfBase64, setPdfBase64] = useState(null); // Base64 PDF for WebView
  const [loading, setLoading] = useState(false);
  const [studentRequests, setStudentRequests] = useState([]); 
  const [selectedUserId, setSelectedUserId] = useState(""); 
  const [selectedRequest, setSelectedRequest] = useState(null); 

  useEffect(() => {
    fetchStudentRequests(); 
  }, []);

  // 🔹 Fetch student requests
  const fetchStudentRequests = async () => {
    try {
      const response = await axios.get(`http://${IP}:5000/api/requests/students`);
      console.log("Student Requests:", response.data);
      setStudentRequests(response.data);
    } catch (error) {
      console.error("Error fetching student requests:", error);
    }
  };

  // 🔹 Fetch request details based on selected user
  const fetchRequestData = async (userId) => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await axios.get(`http://${IP}:5000/api/request-details/${userId}`);
      setSelectedRequest(response.data);
      generatePDF(response.data);
    } catch (error) {
      console.error("Error fetching request details:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Generate PDF and Convert to Base64
  const generatePDF = async (data) => {
    if (!data) return;
    const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { color: #F22E63; text-align: center; }
          .table-container { width: 100%; margin-top: 20px; border-collapse: collapse; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid black; padding: 10px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>Industry Visit Approval Form</h2>
        <table>
          <tr>
            <th>Student Name</th>
            <td>${data.studentName}</td>
          </tr>
          <tr>
            <th>Department</th>
            <td>${data.department}</td>
          </tr>
          <tr>
            <th>Industry Name</th>
            <td>${data.industry}</td>
          </tr>
          <tr>
            <th>Visit Date</th>
            <td>${new Date(data.date).toDateString()}</td>
          </tr>
          <tr>
            <th>Number of Students</th>
            <td>${data.studentsCount}</td>
          </tr>
          <tr>
            <th>Faculty</th>
            <td>${data.faculty}</td>
          </tr>
          <tr>
            <th>Transport</th>
            <td>${data.transport}</td>
          </tr>
          <tr>
            <th>Package Details</th>
            <td>${data.packageDetails}</td>
          </tr>
          <tr>
            <th>Activity Plan</th>
            <td>${data.activity}</td>
          </tr>
          <tr>
            <th>Duration</th>
            <td>${data.duration} days</td>
          </tr>
          <tr>
            <th>Distance</th>
            <td>${data.distance} km</td>
          </tr>
          <tr>
            <th>Ticket Cost</th>
            <td>₹${data.ticketCost}</td>
          </tr>
          <tr>
            <th>Approval Status</th>
            <td>Pending</td>
          </tr>
        </table>

        <h3>Checklist</h3>
        <table>
          <tr><th>Item</th><th>Submitted</th></tr>
          <tr><td>Minutes of Meeting</td><td>${data.checklist.minutesOfMeeting ? "Yes" : "No"}</td></tr>
          <tr><td>List of Students</td><td>${data.checklist.studentList ? "Yes" : "No"}</td></tr>
          <tr><td>Tour Itinerary</td><td>${data.checklist.tourItinerary ? "Yes" : "No"}</td></tr>
          <tr><td>Undertaking</td><td>${data.checklist.undertaking ? "Yes" : "No"}</td></tr>
          <tr><td>Permission Letter</td><td>${data.checklist.permissionLetter ? "Yes" : "No"}</td></tr>
          <tr><td>Permanent Faculty</td><td>${data.checklist.permanentFaculty ? "Yes" : "No"}</td></tr>
          <tr><td>Lady Faculty</td><td>${data.checklist.ladyFaculty ? "Yes" : "No"}</td></tr>
          <tr><td>Educational Tour</td><td>${data.checklist.educationalTour ? "Yes" : "No"}</td></tr>
          <tr><td>Night Journey Avoided</td><td>${data.checklist.nightJourney ? "Yes" : "No"}</td></tr>
          <tr><td>Driver License</td><td>${data.checklist.driverLicense ? "Yes" : "No"}</td></tr>
          <tr><td>Vehicle RC Book</td><td>${data.checklist.vehicleRCBook ? "Yes" : "No"}</td></tr>
          <tr><td>Hotel Booking Proof</td><td>${data.checklist.hotelBooking ? "Yes" : "No"}</td></tr>
        </table>
      </body>
    </html>
  `;

    // ✅ Generate the PDF file
    const { uri } = await printToFileAsync({ html, base64: false });
    console.log("PDF Generated at:", uri);

    // ✅ Move the file to a public directory
    const pdfPath = `${FileSystem.documentDirectory}approval-form.pdf`;
    await FileSystem.moveAsync({ from: uri, to: pdfPath });

    // ✅ Convert PDF to Base64
    const base64 = await FileSystem.readAsStringAsync(pdfPath, { encoding: FileSystem.EncodingType.Base64 });

    // ✅ Update state with both paths
    setPdfUri(pdfPath); // For opening in external viewer
    setPdfBase64(`data:application/pdf;base64,${base64}`); // For WebView
  };

  // 🔹 Open PDF in External Viewer

  const openPDF = async () => {
    if (pdfUri) {
      try {
        // ✅ Convert file:// URI to content:// URI
        const contentUri = await FileSystem.getContentUriAsync(pdfUri);
  
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1, // ✅ Required to grant read permission
          type: "application/pdf",
        });
      } catch (error) {
        console.error("Error opening PDF:", error);
      }
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "white" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", color: "#F22E63" }}>
        Select Student Request
      </Text>

      {/* Student Request Dropdown */}
      <Picker
        selectedValue={selectedUserId}
        onValueChange={(userId) => {
          setSelectedUserId(userId);
          fetchRequestData(userId);
        }}
        style={{ marginVertical: 10, height: 50 }}
      >
        <Picker.Item label="Select Student" value="" />
        {studentRequests.map((request, index) => (
          request.Obj_id && (
            <Picker.Item 
              key={index} 
              label={`${request.Obj_id.fullName} (${request.Obj_id.email})`} 
              value={request.Obj_id._id} 
            />
          )
        ))}
      </Picker>

      {/* Display PDF */}
      {loading ? (
        <ActivityIndicator size="large" color="#f43f5e" />
      ) : pdfBase64 ? (
        <>
          <WebView source={{ uri: pdfBase64 }} style={{ flex: 1, marginTop: 10 }} />
          <TouchableOpacity 
            onPress={openPDF} 
            style={{ padding: 15, backgroundColor: "#007BFF", marginTop: 10, borderRadius: 5 }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>Open PDF in External Viewer</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={{ textAlign: "center", color: "gray", marginTop: 20 }}>
          No request selected.
        </Text>
      )}
    </View>
  );
}
