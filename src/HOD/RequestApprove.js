import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Button,
} from "react-native";
import { WebView } from "react-native-webview";
import { printToFileAsync } from "expo-print";
import axios from "axios";
import { IP } from "@env";
import * as FileSystem from "expo-file-system";
import * as Permissions from "expo-permissions";

import * as IntentLauncher from "expo-intent-launcher";

import * as Sharing from "expo-sharing";

export default function PDFPreview() {
  const [pdfUri, setPdfUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentRequests, setStudentRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showPdf, setShowPdf] = useState(false); // State to control PDF visibility

  useEffect(() => {
    fetchStudentRequests();
    requestPermissions(); // Request file system permissions
  }, []);

  // Request file system permissions
  const requestPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
    if (status !== "granted") {
      console.error("Permission denied!");
    }
  };

  // Fetch student requests
  const fetchStudentRequests = async () => {
    try {
      const response = await axios.get(
        `http://${IP}:5000/api/requests/students`
      );
      const validRequests = response.data.filter(
        (request) => request.Obj_id !== null
      );
      setStudentRequests(validRequests);
    } catch (error) {
      console.error("Error fetching student requests:", error);
    }
  };

  // Fetch request details & generate PDF
  const fetchRequestData = async (userId) => {
    if (!userId) return;
    try {
      setLoading(true);
      setSelectedRequestId(userId);
      const response = await axios.get(
        `http://${IP}:5000/api/request-details/${userId}`
      );
      await generatePDF(response.data);
    } catch (error) {
      console.error("Error fetching request details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update request status
  const updateStatus = async (userId, status) => {
    try {
      setLoading(true);
      await axios.put(`http://${IP}:5000/api/request-status/${userId}`, {
        status,
      });
      setStudentRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.Obj_id._id === userId
            ? { ...request, Obj_id: { ...request.Obj_id, status } }
            : request
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete request
  const deleteRequest = async (userId) => {
    try {
      setLoading(true);
      await axios.delete(`http://${IP}:5000/api/request-status/${userId}`, {
        userId,
      });
      setStudentRequests((prevRequests) =>
        prevRequests.filter((request) => request.Obj_id._id !== userId)
      );
    } catch (error) {
      console.error("Error deleting request:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF and upload to server
  const generatePDF = async (data) => {
    if (!data) return;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Tour Checklist</title>
          <style>
              body {
              }
              h2 {
                  text-align: center;
              }
              table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
              }
              th, td {
                  border: 1px solid black;
                  padding: 8px;
                  text-align: left;
              }
              th {
                  background-color: #f2f2f2;
              }
              .section {
                  margin-top: 20px;
              }
              h3 {
                  text-align: center;
              }
              .pdf {
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  font-family: Arial, sans-serif;
                  margin: 40px;
                  padding: 20px;
                  border: 2px solid black;
              }
          </style>
      </head>
      <body>
          <div class="pdf">
              <h2>Govt. Engineering College Idukki</h2>
              <p><strong>Student Name:</strong> ${data.studentName}</p>
              <p><strong>Department (tick):</strong> ${data.department}</p>
              <p><strong>Semester (tick):</strong> ${data.Semester}</p>
              <p><strong>Industry Name:</strong>${data.industry}</p>
              <p><strong>Number of Students:</strong>${data.studentsCount}</p>
              <p><strong>Transport(tick):</strong> ${data.transport}</p>
              <p><strong>Package Details:</strong> ${data.packageDetails}</p>
              <p><strong>Activity Plan Details:</strong>${data.duration} days</p>
              <p><strong>Duration:</strong> ${data.packageDetails}</p>
              <p><strong>Distance:</strong>${data.distance} km</p>
              <p><strong>Ticket Cost</strong>₹${data.ticketCost}</p>
              <p><strong>Approval Status:</strong>${data.status}</p>
              <h3>CHECK LIST FOR SUBMISSION OF DOCUMENTS FOR STUDENTS’ TOUR</h3>
              <table>
                  <tr>
                      <th>No.</th>
                      <th>Item</th>
                      <th>Whether complied/submitted</th>
                  </tr>
                  <tr>
                      <td>1.</td>
                      <td>Minutes of relevant tour committee meeting (ET-02)</td>
                      <td>${data.checklist.minutesOfMeeting ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                      <td>2.</td>
                      <td>List of students (ET-03) and list of accompanying faculty with their willingness (ET-04).</td>
                      <td>${data.checklist.studentList ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                      <td>3.</td>
                      <td>Tour Itinerary (ET-05).</td>
                      <td>${data.checklist.tourItinerary ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                      <td>4.</td>
                      <td>Written undertaking by students/parents (ET-06)</td>
                      <td>${data.checklist.undertaking ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                      <td>5.</td>
                      <td>Permission letters from industry.</td>
                      <td>${data.checklist.permissionLetter ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                      <td>6.</td>
                      <td>Whether accompanied by permanent faculty member.</td>
                      <td>${data.checklist.permanentFaculty ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                      <td>7.</td>
                      <td>Whether accompanied by permanent lady faculty member.</td>
                      <td>${data.checklist.ladyFaculty ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                      <td>8.</td>
                      <td>Whether the tour is 80% educational.</td>
                      <td>${data.checklist.educationalTour ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                      <td>9.</td>
                      <td>Whether night journey avoided (for road trips).</td>
                      <td>${data.checklist.nightJourney ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                      <td>10.</td>
                      <td>Whether copy of driving license of driver attached.</td>
                      <td>${data.checklist.driverLicense ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                      <td>11.</td>
                      <td>Whether copy of RC Book of the conveyance vehicle attached.</td>
                      <td>${data.checklist.vehicleRCBook ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                      <td>12.</td>
                      <td>Whether proof attached for confirmed Hotel Booking.</td>
                      <td>${data.checklist.hotelBooking ? "Yes" : "No"}</td>
                  </tr>
              </table>
              <div class="section">
                  <p><strong>Modes of transport involved (tick one or more):</strong> ${data.transport}</p>
                  <p><strong>Name, address & Phone No. of cab/transport operator (for road journeys):</strong></p>
                  <p><strong>Names and Phone Nos. of driver/s (for road journeys):</strong>${data.driverPhoneNumber}</p>
              </div>
              <div class="section">
                  <p><strong>Certified that the above data are correct</strong></p>
                  <p><strong>Name & dated signature of student convener/s:</strong></p>
                  <p><strong>Name & dated signature of faculty convener/s:</strong></p>
              </div>
              <p><strong>ET-01</strong></p>
          </div>
      </body>
      </html>
    `;

    // Generate the PDF file
    const { uri } = await printToFileAsync({ html, base64: false });

    // Move file to a shareable location
    const pdfPath = `${FileSystem.documentDirectory}approval-form.pdf`;
    await FileSystem.moveAsync({ from: uri, to: pdfPath });

    // Verify file exists
    const fileInfo = await FileSystem.getInfoAsync(pdfPath);
    if (fileInfo.exists) {
      console.log("File exists at:", pdfPath);

      // Upload the file to the server
      const formData = new FormData();
      formData.append("file", {
        uri: pdfPath,
        name: "approval-form.pdf",
        type: "application/pdf",
      });

      try {
        const response = await axios.post(
          `http://${IP}:5000/api/upload-pdf`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("File uploaded successfully:", response.data);
        setPdfUri(response.data.filePath); // Use the server file path
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    } else {
      console.error("File does not exist at:", pdfPath);
    }
  };
  const openPDF = async () => {
    if (pdfUri) {
      try {
        // ✅ Use the uploaded PDF URL (modify as needed)
        const pdfUrl = `http://${IP}:5000/uploads/approval-form.pdf`;
  
        // ✅ Download the PDF to a temporary file
        const fileUri = `${FileSystem.documentDirectory}approval-form.pdf`;
        const { uri } = await FileSystem.downloadAsync(pdfUrl, fileUri);
  
        // ✅ Share/Open with external apps
        await Sharing.shareAsync(uri);
      } catch (error) {
        console.error("Error opening PDF:", error);
      }
    }
  };
  
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "white" }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center",
          color: "#F22E63",
        }}
      >
        Student Requests
      </Text>

      {/* Student Requests */}
      <ScrollView style={{ marginTop: 10 }}>
        {studentRequests.length > 0 ? (
          studentRequests.map((request, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => fetchRequestData(request.Obj_id._id)}
              style={{
                padding: 15,
                backgroundColor: "#f8d7da",
                borderRadius: 8,
                marginBottom: 10,
                borderLeftWidth: 5,
                borderColor: "#F22E63",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {request.Obj_id.fullName}
              </Text>
              <Text style={{ color: "gray" }}>{request.Obj_id.email}</Text>
              {/* Status Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  onPress={() => updateStatus(request.Obj_id._id, "Approved")}
                  style={{
                    backgroundColor: "#4CAF50",
                    padding: 10,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: "white" }}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateStatus(request.Obj_id._id, "Rejected")}
                  style={{
                    backgroundColor: "#f44336",
                    padding: 10,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: "white" }}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateStatus(request.Obj_id._id, "Pending")}
                  style={{
                    backgroundColor: "#FFC107",
                    padding: 10,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: "white" }}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteRequest(request.Obj_id._id)}
                  style={{
                    backgroundColor: "#FF0000",
                    padding: 10,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: "white" }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ textAlign: "center", color: "gray" }}>
            No requests found.
          </Text>
        )}
      </ScrollView>
      

      {/* Button to Open PDF */}
      {pdfUri && selectedRequestId && (
        <View style={{ marginTop: 20 }}>
          <Button
            title="Open PDF"
            onPress={openPDF} // Show PDF when button is clicked
          />
        </View>
      )}
{showPdf && pdfUri && (
  <View style={{ flex: 1, marginTop: 20, borderRadius: 8 }}>
    <WebView source={{ uri: pdfUri }} style={{ flex: 1 }} />
  </View>
)}

  

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#f43f5e" />}
    </View>
  );
}

const styles = StyleSheet.create({
  pdfContainer: {
    flex: 1,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
});