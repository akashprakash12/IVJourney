import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { AuthContext } from "../../context/Authcontext";
import axios from "axios";
import { IP } from "@env";

export default function Status() {
  const { userDetails } = useContext(AuthContext);
  const [studentID, setStudentID] = useState(userDetails?.studentID || "");
  const [votedUsers, setVotedUsers] = useState([]);
  const [genderRatio, setGenderRatio] = useState({ maleCount: 0, femaleCount: 0 });
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await axios.get(`http://${IP}:5000/api/votes-details`); // Replace with actual backend URL
        setVotedUsers(response.data.votedUsers);
        setGenderRatio(response.data.genderRatio);
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };

    fetchVotes();
  }, []);

  const total = genderRatio.maleCount + genderRatio.femaleCount;
  const girlsPercentage = total > 0 ? (genderRatio.femaleCount / total) * 100 : 0;
  const boysPercentage = total > 0 ? (genderRatio.maleCount / total) * 100 : 0;

  // Data for the pie chart
  const data = [
    {
      name: "Girls",
      population: genderRatio.femaleCount,
      color: "#FF69B4", // Pink for girls
      legendFontColor: "#333",
      legendFontSize: 15,
    },
    {
      name: "Boys",
      population: genderRatio.maleCount,
      color: "#87CEEB", // Blue for boys
      legendFontColor: "#333",
      legendFontSize: 15,
    },
  ];

  const statusColor = {
    Approved: "#4CAF50",
    Rejected: "#F44336",
    Pending: "#FFC107",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students List</Text>

      {/* Pie Chart */}
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
        hasLegend={true}
      />

      {/* Labels */}
      <View style={styles.labelsContainer}>
        <View style={styles.label}>
          <View style={[styles.colorBox, { backgroundColor: "#FF69B4" }]} />
          <Text style={styles.labelText}>Girls: {genderRatio.femaleCount} ({girlsPercentage.toFixed(1)}%)</Text>
        </View>
        <View style={styles.label}>
          <View style={[styles.colorBox, { backgroundColor: "#87CEEB" }]} />
          <Text style={styles.labelText}>Boys: {genderRatio.maleCount} ({boysPercentage.toFixed(1)}%)</Text>
        </View>
      </View>

      {/* Status Section */}
      <View style={styles.statusContainer}>
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
    marginBottom: 20,
    color: "#333",
  },
  labelsContainer: {
    width: "100%",
    marginTop: 20,
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  labelText: {
    fontSize: 16,
    color: "#333",
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

