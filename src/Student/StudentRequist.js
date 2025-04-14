import React, { useContext, useEffect, useState } from "react";
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
// import { FormData } from 'formdata-node'; // If using in node
import { AuthContext } from "../../context/Authcontext";

export default function UndertakingForm() {
  const { userDetails } = useContext(AuthContext);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [formData, setFormData] = useState({
    obj_id: userDetails._id,
    studentName: "",
    semester: "",
    branch: "",
    rollNo: "",
    studentID:"",
    parentName: "",
    placesVisited: "",
    tourPeriod: "",
    facultyDetails: ""
  });
  const [studentSignature, setStudentSignature] = useState(null);
  const [parentSignature, setParentSignature] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`http://${IP}:5000/api/getProfile/${userDetails.email}`);
        const profileData = response.data;
       
        
        setFormData(prev => ({
          ...prev,
          studentName: profileData.name || prev.studentName,
          branch: profileData.branch || prev.branch,
          semester: profileData.semester || prev.semester,
          studentID: profileData.studentID || prev.studentID
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert(
          'Info',
          'Could not load student details. Please enter them manually.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, );

  // Request camera roll permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'Need access to your photos for signature uploads',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const pickSignature = async (type) => {
    try {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Cannot access photos without permission');
          return;
        }
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 2],
        quality: 0.8
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        type === 'student' 
          ? setStudentSignature(result.assets[0].uri)
          : setParentSignature(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (!value && key !== 'obj_id') {
        newErrors[key] = 'This field is required';
        isValid = false;
      }
    });

    // Validate signatures
    if (!studentSignature) {
      newErrors.studentSignature = 'Student signature required';
      isValid = false;
    }
    if (!parentSignature) {
      newErrors.parentSignature = 'Parent signature required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('obj_id', userDetails._id);
      console.log(formDataToSend);
      

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'obj_id') formDataToSend.append(key, value);
      });

      // Append signatures
      if (studentSignature) {
        formDataToSend.append('studentSignature', {
          uri: studentSignature,
          name: `student_${Date.now()}.jpg`,
          type: 'image/jpeg'
        });
      }
      if (parentSignature) {
        formDataToSend.append('parentSignature', {
          uri: parentSignature,
          name: `parent_${Date.now()}.jpg`,
          type: 'image/jpeg'
        });
      }

      const response = await axios.post(
        `http://${IP}:5000/api/undertaking`,
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      Alert.alert('Success', 'Undertaking submitted successfully!', [{
        text: 'OK',
        onPress: () => {
          setFormData({
            obj_id: userDetails._id,
            studentName: "",
            semester: "",
            branch: "",
            rollNo: "",
            studentID:"",
            parentName: "",
            placesVisited: "",
            tourPeriod: "",
            facultyDetails: ""
          });
          setStudentSignature(null);
          setParentSignature(null);
          setErrors({});
        }
      }]);

    } catch (error) {
      console.error('Submission error:', error);
      let message = 'Submission failed';
      if (error.response) {
        if (error.response.status === 409) {
          const existingDate = error.response.data.details?.existingSubmission?.date;
          message = `Already submitted on ${new Date(existingDate).toLocaleDateString()}`;
        } else {
          message = error.response.data?.error || `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        message = 'No server response. Check your connection.';
      } else {
        message = error.message || 'Unknown error occurred';
      }
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F22E63" />
        <Text style={styles.loadingText}>Loading your details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          {/* Auto-populated Fields (read-only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Student Name</Text>
            <TextInput
              style={styles.input}
              value={formData.studentName}
              onChangeText={(text) => handleInputChange('studentName', text)}
              editable={!formData.studentName}
              placeholder="Loading..."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Branch</Text>
            <TextInput
              style={styles.input}
              value={formData.branch}
              onChangeText={(text) => handleInputChange('branch', text)}
              
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Semester</Text>
            <TextInput
              style={styles.input}
              value={formData.semester}
              onChangeText={(text) => handleInputChange('semester', text)}
              keyboardType="numeric"
             
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Roll No.</Text>
            <TextInput
              style={styles.input}
              
              onChangeText={(text) => handleInputChange('rollNo', text)}
            
            />
          </View>
           
          <View style={styles.inputGroup}>
            <Text style={styles.label}>studentID</Text>
            <TextInput
              style={styles.input}
              value={formData.studentID}
              onChangeText={(text) => handleInputChange('studentID', text)}
              editable={!formData.rollNo}
              placeholder="Loading..."
            />
          </View>

          {/* Manually entered fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Parent's Name</Text>
            <TextInput
              style={[styles.input, errors.parentName && styles.inputError]}
              value={formData.parentName}
              onChangeText={(text) => handleInputChange('parentName', text)}
              placeholder="Enter parent's name"
              autoCapitalize="words"
            />
            {errors.parentName && <Text style={styles.errorText}>{errors.parentName}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Places to Visit</Text>
            <TextInput
              style={[styles.input, errors.placesVisited && styles.inputError]}
              value={formData.placesVisited}
              onChangeText={(text) => handleInputChange('placesVisited', text)}
              placeholder="Enter places to visit"
            />
            {errors.placesVisited && <Text style={styles.errorText}>{errors.placesVisited}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tour Period</Text>
            <TextInput
              style={[styles.input, errors.tourPeriod && styles.inputError]}
              value={formData.tourPeriod}
              onChangeText={(text) => handleInputChange('tourPeriod', text)}
              placeholder="DD/MM/YYYY - DD/MM/YYYY"
            />
            {errors.tourPeriod && <Text style={styles.errorText}>{errors.tourPeriod}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Accompanying Faculty</Text>
            <TextInput
              style={[styles.input, errors.facultyDetails && styles.inputError]}
              value={formData.facultyDetails}
              onChangeText={(text) => handleInputChange('facultyDetails', text)}
              placeholder="Enter faculty details"
            />
            {errors.facultyDetails && <Text style={styles.errorText}>{errors.facultyDetails}</Text>}
          </View>

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
            {errors.studentSignature && <Text style={styles.errorText}>{errors.studentSignature}</Text>}
            {studentSignature && (
              <Image source={{ uri: studentSignature }} style={styles.signaturePreview} />
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
            {errors.parentSignature && <Text style={styles.errorText}>{errors.parentSignature}</Text>}
            {parentSignature && (
              <Image source={{ uri: parentSignature }} style={styles.signaturePreview} />
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <LinearGradient colors={["#FF6480", "#F22E63"]} style={styles.gradient}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333'
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