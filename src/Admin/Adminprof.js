import React from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, Feather, Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF0080', '#E91E63']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Feather name="settings" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: "https://via.placeholder.com/150" }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Feather name="camera" size={20} color="white" />
            </TouchableOpacity>
            <View style={styles.onlineStatus} />
          </View>

          <Text style={styles.userName}>Stone Stellar</Text>
          <Text style={styles.userBio}>Computer Science Student</Text>

          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={20} color="#E91E63" />
            <TextInput
              style={styles.infoInput}
              placeholder="Full Name"
              placeholderTextColor="#888"
              value="Stone Stellar"
            />
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="id-card-outline" size={20} color="#E91E63" />
            <TextInput
              style={styles.infoInput}
              placeholder="Student ID"
              placeholderTextColor="#888"
              value="CS-2021-045"
            />
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="school-outline" size={20} color="#E91E63" />
            <TextInput
              style={styles.infoInput}
              placeholder="Branch"
              placeholderTextColor="#888"
              value="Computer Science"
            />
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={20} color="#E91E63" />
            <TextInput
              style={styles.infoInput}
              placeholder="Email"
              placeholderTextColor="#888"
              value="stone@university.edu"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="phone-outline" size={20} color="#E91E63" />
            <TextInput
              style={styles.infoInput}
              placeholder="Phone Number"
              placeholderTextColor="#888"
              value="+1 234 567 890"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerGradient: {
    height: 160,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 40,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
  },
  backButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "center",
    marginTop: -70,
  },
  avatarContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "white",
  },
  cameraButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#E91E63",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  onlineStatus: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "white",
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    marginTop: 16,
    color: "#333",
  },
  userBio: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  editProfileButton: {
    backgroundColor: "#E91E63",
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 16,
    elevation: 4,
  },
  editProfileButtonText: {
    color: "white",
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    elevation: 4,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  infoInput: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingVertical: 8,
  },
  saveButton: {
    backgroundColor: "#E91E63",
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    elevation: 4,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});