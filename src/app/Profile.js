import React from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { FontAwesome5, Feather, Ionicons } from "@expo/vector-icons";

export default ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.header}>Profile</Text>

      <View style={styles.profileContainer}>
        <View style={styles.profileImageWrapper}>
          <Image
            source={{ uri: "https://via.placeholder.com/100" }} // Replace with actual image URL
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editIcon}>
            <FontAwesome5 name="sync-alt" size={14} color="white" />
          </TouchableOpacity>
          <View style={styles.statusIndicator} />
        </View>
        <Text style={styles.profileName}>Stone Stellar</Text>
        <TouchableOpacity style={styles.editBioButton}>
          <Text style={styles.editBioText}>Edit Bio</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} placeholder="Enter name" />

        <Text style={styles.label}>Student ID</Text>
        <TextInput style={styles.input} placeholder="Enter student ID" />

        <Text style={styles.label}>Branch</Text>
        <TextInput style={styles.input} placeholder="Enter branch" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="Enter email" keyboardType="email-address" />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} placeholder="Enter phone number" keyboardType="phone-pad" />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E91E63",
    textAlign: "center",
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#E91E63",
  },
  editIcon: {
    position: "absolute",
    top: 38,
    left: 38,
    backgroundColor: "#E91E63",
    padding: 5,
    borderRadius: 50,
  },
  statusIndicator: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 15,
    height: 15,
    backgroundColor: "green",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  editBioButton: {
    backgroundColor: "#E91E63",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 5,
  },
  editBioText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  inputContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#E91E63",
    fontSize: 16,
    marginBottom: 15,
    paddingVertical: 5,
  },
  tabBar: {
    backgroundColor: "#E91E63",
    height: 70,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 10,
  },
});
