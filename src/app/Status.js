import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit"; // For circular representation

export default function Status() {
  const [girls, setGirls] = useState(60); // Number of girls
  const [boys, setBoys] = useState(40); // Number of boys
  const [status, setStatus] = useState("Pending"); // Status of the requested letter

  const total = girls + boys;
  const girlsPercentage = (girls / total) * 100;
  const boysPercentage = (boys / total) * 100;

  // Data for the pie chart
  const data = [
    {
      name: "Girls",
      population: girls,
      color: "#FF69B4", // Pink for girls
      legendFontColor: "#333",
      legendFontSize: 15,
    },
    {
      name: "Boys",
      population: boys,
      color: "#87CEEB", // Blue for boys
      legendFontColor: "#333",
      legendFontSize: 15,
    },
  ];

  // Determine status color
  const statusColor = {
    Approved: "#4CAF50", // Green for Approved
    Rejected: "#F44336", // Red for Rejected
    Pending: "#FFC107", // Yellow for Pending
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students List</Text>

      {/* Circular Representation (Pie Chart) */}
      <PieChart
        data={data}
        width={Dimensions.get("window").width - 40}
        height={200}
        chartConfig={{
          backgroundColor: "#F5F5F5",
          backgroundGradientFrom: "#F5F5F5",
          backgroundGradientTo: "#F5F5F5",
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        hasLegend={true} // Show legend
      />

      {/* Labels */}
      <View style={styles.labelsContainer}>
        <View style={styles.label}>
          <View style={[styles.colorBox, { backgroundColor: "#FF69B4" }]} />
          <Text style={styles.labelText}>Girls: {girls} ({girlsPercentage.toFixed(1)}%)</Text>
        </View>
        <View style={styles.label}>
          <View style={[styles.colorBox, { backgroundColor: "#87CEEB" }]} />
          <Text style={styles.labelText}>Boys: {boys} ({boysPercentage.toFixed(1)}%)</Text>
        </View>
      </View>

      {/* Status Section */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Request Status</Text>
        <View
          style={[
            styles.statusBox,
            { backgroundColor: statusColor[status] }, // Dynamic status color
          ]}
        >
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  labelsContainer: {
    width: "100%",
    marginTop: 20,
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20, // Space between notification and status box
  },
  notificationText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  statusContainer: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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