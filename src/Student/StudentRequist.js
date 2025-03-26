import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import axios from 'axios';
import { IP } from "@env";

export default function UndertakingForm() {
  const [formData, setFormData] = useState({
    studentName: "",
    semester: "",
    branch: "",
    rollNo: "",
    parentName: "",
    placesVisited: "",
    tourPeriod: "",
    facultyDetails: ""
  });
  const [studentSignature, setStudentSignature] = useState(null);
  const [parentSignature, setParentSignature] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Request camera roll permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required', 
          'We need access to your photos to upload signatures',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const pickSignature = async (type) => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images', // Simplest working solution
        allowsEditing: true,
        aspect: [4, 2],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0].base64) {
        const base64String = `data:image/jpeg;base64,${result.assets[0].base64}`;
        if (type === 'student') {
          setStudentSignature(base64String);
        } else {
          setParentSignature(base64String);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Check text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (!value) {
        newErrors[key] = 'This field is required';
        isValid = false;
      }
    });

    // Check signatures
    if (!studentSignature) {
      newErrors.studentSignature = 'Student signature is required';
      isValid = false;
    }
    if (!parentSignature) {
      newErrors.parentSignature = 'Parent signature is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill all required fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        studentSignature,
        parentSignature
      };

      // First verify the API endpoint is correct
      const apiUrl = `http://${IP}:5000/api/undertaking`;
      console.log("Attempting to submit to:", apiUrl);

      // Test the connection first
      try {
        const testResponse = await axios.get(`http://${IP}:5000`);
        console.log("Server connection test:", testResponse.data);
      } catch (testError) {
        console.error("Server connection test failed:", testError);
        throw new Error("Could not connect to server. Please check your network and server status.");
      }

      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      });

      Alert.alert(
        'Success', 
        'Undertaking submitted successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Reset form
              setFormData({
                studentName: "",
                semester: "",
                branch: "",
                rollNo: "",
                parentName: "",
                placesVisited: "",
                tourPeriod: "",
                facultyDetails: ""
              });
              setStudentSignature(null);
              setParentSignature(null);
              setErrors({});
            }
          }
        ]
      );

    } catch (error) {
      console.error('Submission error:', error);
      
      let errorMessage = 'An error occurred while submitting';
      if (error.response) {
        errorMessage = error.response.data?.message || 
                     `Server responded with ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Check your internet connection and server URL.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      Alert.alert('Submission Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          {/* Form Fields */}
          {[
            { label: 'Student Name', key: 'studentName', autoCapitalize: 'words' },
            { label: 'Semester', key: 'semester', keyboardType: 'numeric' },
            { label: 'Branch', key: 'branch', autoCapitalize: 'words' },
            { label: 'Roll No.', key: 'rollNo' },
            { label: 'Parent\'s Name', key: 'parentName', autoCapitalize: 'words' },
            { label: 'Places to Visit', key: 'placesVisited' },
            { label: 'Tour Period', key: 'tourPeriod', placeholder: 'DD/MM/YYYY - DD/MM/YYYY' },
            { label: 'Accompanying Faculty', key: 'facultyDetails' },
          ].map((field) => (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={[
                  styles.input,
                  errors[field.key] && styles.inputError
                ]}
                value={formData[field.key]}
                onChangeText={(text) => handleInputChange(field.key, text)}
                placeholder={field.placeholder || `Enter ${field.label}`}
                autoCapitalize={field.autoCapitalize || 'none'}
                keyboardType={field.keyboardType || 'default'}
              />
              {errors[field.key] && (
                <Text style={styles.errorText}>{errors[field.key]}</Text>
              )}
            </View>
          ))}

          {/* Signature Uploads */}
          <View style={styles.signatureSection}>
            <Text style={styles.label}>Student Signature</Text>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => pickSignature('student')}
            >
              <Text style={styles.uploadButtonText}>
                {studentSignature ? 'Change Signature' : 'Upload Signature'}
              </Text>
            </TouchableOpacity>
            {errors.studentSignature && (
              <Text style={styles.errorText}>{errors.studentSignature}</Text>
            )}
            {studentSignature && (
              <Image 
                source={{ uri: studentSignature }} 
                style={styles.signaturePreview} 
              />
            )}
          </View>

          <View style={styles.signatureSection}>
            <Text style={styles.label}>Parent Signature</Text>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => pickSignature('parent')}
            >
              <Text style={styles.uploadButtonText}>
                {parentSignature ? 'Change Signature' : 'Upload Signature'}
              </Text>
            </TouchableOpacity>
            {errors.parentSignature && (
              <Text style={styles.errorText}>{errors.parentSignature}</Text>
            )}
            {parentSignature && (
              <Image 
                source={{ uri: parentSignature }} 
                style={styles.signaturePreview} 
              />
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={["#FF6480", "#F22E63"]}
              style={styles.gradient}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Form</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
  },
  inputError: {
    borderColor: '#F22E63',
    backgroundColor: '#FFF0F3',
  },
  errorText: {
    color: '#F22E63',
    fontSize: 12,
    marginTop: 4,
  },
  signatureSection: {
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#F22E63",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  signaturePreview: {
    width: '100%',
    height: 120,
    resizeMode: "contain",
    borderColor: "#eee",
    borderWidth: 1,
    borderRadius: 8,
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  gradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});