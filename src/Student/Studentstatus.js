import { StyleSheet, Text, View, Button,TextInput , ScrollView, ActivityIndicator, Image, Alert, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { IP } from "@env"; 
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
// import { FormData } from 'formdata-node'; // If using in node


export default function Studentstatus({ route }) {
  const [undertaking, setUndertaking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    semester: '',
    branch: '',
    rollNo: '',
    parentName: '',
    placesVisited: '',
    tourPeriod: '',
    facultyDetails: ''
  });
  const { id } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUndertaking = async () => {
      try {
        const response = await axios.get(`http://${IP}:5000/api/undertaking/${id}`);
        console.log(response.data);
        
        setUndertaking(response.data.data);
        setFormData({
          studentName: response.data.data.studentName,
          semester: response.data.data.semester,
          branch: response.data.data.branch,
          rollNo: response.data.data.rollNo,
          parentName: response.data.data.parentName,
          placesVisited: response.data.data.placesVisited,
          tourPeriod: response.data.data.tourPeriod,
          facultyDetails: response.data.data.facultyDetails
        });
      } catch (err) {
        console.error('Error fetching undertaking:', err);
        if (err.response?.status === 404) {
          setError('Student has not submitted undertaking request');
        } else {
          setError(err.response?.data?.error || 'Failed to fetch undertaking');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchUndertaking();
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`http://${IP}:5000/api/undertaking/${id}`, formData);
      
      setUndertaking(response.data.data);
      setIsEditing(false);
      Alert.alert('Success', 'Undertaking updated successfully');
    } catch (err) {
      console.error('Error updating undertaking:', err);
      Alert.alert('Error', err.response?.data?.error || 'Failed to update undertaking');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this undertaking?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              setLoading(true);
              await axios.delete(`http://${IP}:5000/api/undertaking/${id}`);
              Alert.alert('Success', 'Undertaking deleted successfully');
              navigation.goBack();
            } catch (err) {
              console.error('Error deleting undertaking:', err);
              Alert.alert('Error', err.response?.data?.error || 'Failed to delete undertaking');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const generatePdf = async () => {
    if (!undertaking) return;
    
    try {
      const studentSignatureImg = undertaking.studentSignature ? 
        `<img src="http://${IP}:5000${undertaking.studentSignature}" width="150" />` : 'Not provided';
      
      const parentSignatureImg = undertaking.parentSignature ? 
        `<img src="http://${IP}:5000${undertaking.parentSignature}" width="150" />` : 'Not provided';

      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial; padding: 20px; }
              h1 { color: #333; text-align: center; }
              .section { margin-bottom: 15px; }
              .label { font-weight: bold; }
              .signature-container { display: flex; justify-content: space-between; margin-top: 30px; }
              .signature { text-align: center; }
              .header { text-align: center; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Undertaking Form</h1>
              <p>Submitted on: ${new Date(undertaking.submittedAt).toLocaleDateString()}</p>
            </div>

            <div class="section">
              <p class="label">Student Name:</p>
              <p>${undertaking.studentName}</p>
            </div>

            <div class="section">
              <p class="label">Student ID:</p>
              <p>${undertaking.studentID}</p>
            </div>

            <div class="section">
              <p class="label">Roll No:</p>
              <p>${undertaking.rollNo}</p>
            </div>

            <div class="section">
              <p class="label">Branch:</p>
              <p>${undertaking.branch.toUpperCase()}</p>
            </div>

            <div class="section">
              <p class="label">Semester:</p>
              <p>${undertaking.semester}</p>
            </div>

            <div class="section">
              <p class="label">Parent/Guardian Name:</p>
              <p>${undertaking.parentName}</p>
            </div>

            <div class="section">
              <p class="label">Places to be Visited:</p>
              <p>${undertaking.placesVisited}</p>
            </div>

            <div class="section">
              <p class="label">Tour Period:</p>
              <p>${new Date(undertaking.tourPeriod).toLocaleDateString()}</p>
            </div>

            <div class="section">
              <p class="label">Faculty Details:</p>
              <p>${undertaking.facultyDetails}</p>
            </div>

            <div class="signature-container">
              <div class="signature">
                <p class="label">Student Signature:</p>
                ${studentSignatureImg}
              </div>
              <div class="signature">
                <p class="label">Parent Signature:</p>
                ${parentSignatureImg}
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await printToFileAsync({
        html,
        base64: false
      });
      
      await shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });

        // Upload the PDF to server
        const formData = new FormData();
        formData.append('file', {
          uri: uri,
          name: `undertaking-${undertaking._id || Date.now()}.pdf`,
          type: 'application/pdf',
        });
        formData.append("studentId", undertaking._id); // Send student ID

        // 3. Upload to server
        const uploadResponse = await axios.post(
          `http://${IP}:5000/api/upload-pdf`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
    Alert.alert('Success', 'PDF generated and saved successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
    Alert.alert('Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!undertaking) {
    return (
      <View style={styles.container}>
        <Text>No undertaking data found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Undertaking Form</Text>
      <Text style={styles.subHeader}>Submitted on: {new Date(undertaking.submittedAt).toLocaleDateString()}</Text>
   
      
      {isEditing ? (
        <>
          <View style={styles.detailSection}>
            <Text style={styles.label}>Student Name:</Text>
            <TextInput
              style={styles.input}
              value={formData.studentName}
              onChangeText={(text) => handleInputChange('studentName', text)}
            />
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Roll No:</Text>
            <TextInput
              style={styles.input}
              value={formData.rollNo}
              onChangeText={(text) => handleInputChange('rollNo', text)}
            />
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Branch:</Text>
            <TextInput
              style={styles.input}
              value={formData.branch}
              onChangeText={(text) => handleInputChange('branch', text)}
            />
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Semester:</Text>
            <TextInput
              style={styles.input}
              value={formData.semester}
              onChangeText={(text) => handleInputChange('semester', text)}
            />
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Parent/Guardian Name:</Text>
            <TextInput
              style={styles.input}
              value={formData.parentName}
              onChangeText={(text) => handleInputChange('parentName', text)}
            />
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Places to be Visited:</Text>
            <TextInput
              style={styles.input}
              value={formData.placesVisited}
              onChangeText={(text) => handleInputChange('placesVisited', text)}
            />
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Tour Period:</Text>
            <TextInput
              style={styles.input}
              value={formData.tourPeriod}
              onChangeText={(text) => handleInputChange('tourPeriod', text)}
            />
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Faculty Details:</Text>
            <TextInput
              style={styles.input}
              value={formData.facultyDetails}
              onChangeText={(text) => handleInputChange('facultyDetails', text)}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsEditing(false)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.detailSection}>
            <Text style={styles.label}>Student Name:</Text>
            <Text style={styles.value}>{undertaking.studentName}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Student ID:</Text>
            <Text style={styles.value}>{undertaking.studentID}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Roll No:</Text>
            <Text style={styles.value}>{undertaking.rollNo}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Branch:</Text>
            <Text style={styles.value}>{undertaking.branch.toUpperCase()}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Semester:</Text>
            <Text style={styles.value}>{undertaking.semester}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Parent/Guardian Name:</Text>
            <Text style={styles.value}>{undertaking.parentName}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Places to be Visited:</Text>
            <Text style={styles.value}>{undertaking.placesVisited}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Tour Period:</Text>
            <Text style={styles.value}>{new Date(undertaking.tourPeriod).toLocaleDateString()}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.label}>Faculty Details:</Text>
            <Text style={styles.value}>{undertaking.facultyDetails}</Text>
          </View>

          <View style={styles.signatureContainer}>
            <View style={styles.signatureBox}>
              <Text style={styles.label}>Student Signature:</Text>
              {undertaking.studentSignature ? (
                <Image 
                  source={{ uri: `http://${IP}:5000${undertaking.studentSignature}` }}
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.missingSignature}>Not provided</Text>
              )}
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.label}>Parent Signature:</Text>
              {undertaking.parentSignature ? (
                <Image 
                  source={{ uri: `http://${IP}:5000${undertaking.parentSignature}` }}
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.missingSignature}>Not provided</Text>
              )}
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.editButton]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.pdfButton]}
              onPress={generatePdf}
            >
              <Text style={styles.buttonText}>Generate PDF</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#333',
  },
  subHeader: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  detailSection: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  signatureBox: {
    width: '48%',
    alignItems: 'center',
  },
  signatureImage: {
    width: 150,
    height: 80,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  missingSignature: {
    fontStyle: 'italic',
    color: '#999',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  button: {
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 10,
    minWidth: '30%',
  },
  editButton: {
    backgroundColor: '#4a86e8',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  pdfButton: {
    backgroundColor: '#2ecc71',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#ffeeee',
    borderColor: '#ffcccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },

  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});