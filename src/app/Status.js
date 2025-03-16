import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { AuthContext } from "../../context/Authcontext";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function Status() {
  const { userDetails } = useContext(AuthContext);
  const [girls, setGirls] = useState(60);
  const [boys, setBoys] = useState(40);
  const [status, setStatus] = useState("Pending");
  const [notification, setNotification] = useState("");

  // Notifications based on status
  useEffect(() => {
    let message = "";
    if (status === "Approved") {
      message = "✅ Your request has been approved!";
    } else if (status === "Rejected") {
      message = "❌ Your request was rejected. Please check with admin.";
    } else {
      message = "⏳ Your request is pending. Please wait for approval.";
    }

    setNotification(message);
  }, [status]);

  // Function to download and open PDF
  const handleDownloadPDF = async () => {
    const pdfUrl = "https://morth.nic.in/sites/default/files/dd12-13_0.pdf"; // Replace with your PDF URL
    const fileName = "file.pdf";
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    console.log("Downloading file from:", pdfUrl);
    console.log("Saving file to:", fileUri);

    try {
      // Download the file
      const { uri } = await FileSystem.downloadAsync(pdfUrl, fileUri);
      console.log("File downloaded successfully:", uri);

      // Share the file (opens a dialog to view or share the file)
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Open PDF" });
      console.log("File shared successfully");
    } catch (error) {
      console.log("Download or sharing failed:", error);
    }
  };

  const total = girls + boys;
  const data = [
    { name: "Girls", population: girls, color: "#FF69B4", legendFontColor: "#333", legendFontSize: 15 },
    { name: "Boys", population: boys, color: "#87CEEB", legendFontColor: "#333", legendFontSize: 15 },
  ];

  const statusColor = { Approved: "#4CAF50", Rejected: "#F44336", Pending: "#FFC107" };
  const notificationColor = statusColor[status] || "#333";

  return (
    <View style={styles.container}>
      {userDetails.role !== "Industry Representative" && (
        <>
          <Text style={styles.title}>Students Distribution</Text>
          <PieChart
            data={data}
            width={Dimensions.get("window").width - 40}
            height={200}
            chartConfig={{ backgroundColor: "#F5F5F5", backgroundGradientFrom: "#F5F5F5", backgroundGradientTo: "#F5F5F5", color: (opacity) => `rgba(0, 0, 0, ${opacity})` }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={true}
          />
        </>
      )}

      {/* Status Section */}
      <View style={styles.statusContainer}>
        {/* Static Notification Bar */}
        <TouchableOpacity onPress={handleDownloadPDF}>
          <View style={[styles.notificationContainer, { backgroundColor: notificationColor }]}>
            <Text style={styles.notificationText}>{notification}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.statusTitle}>Request Status</Text>
        <View style={[styles.statusBox, { backgroundColor: statusColor[status] }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  notificationContainer: {
    width: "100%", // Full width
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20, // Space between notification and status box
  },
  notificationText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
  statusContainer: {
    width: "100%",
    marginTop: 30,
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  statusBox: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});