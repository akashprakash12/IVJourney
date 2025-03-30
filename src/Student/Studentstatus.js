import { StyleSheet, Text, View, Button, ScrollView, ActivityIndicator, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { IP } from "@env"; 
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';

export default function Studentstatus({ route }) {
  const [undertaking, setUndertaking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = route.params;

  useEffect(() => {
    const fetchUndertaking = async () => {
      try {
        const response = await axios.get(`http://${IP}:5000/api/undertaking/${id}`);
        console.log(response.data);
        
        setUndertaking(response.data.data);
      } catch (err) {
        console.error('Error fetching undertaking:', err);
        setError(err.response?.data?.error || 'Failed to fetch undertaking');
      } finally {
        setLoading(false);
      }
    };

    fetchUndertaking();
  }, [id]);

  const generatePdf = async () => {
    if (!undertaking) return;
    
    try {
      // Construct image tags if signatures exist
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
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF');
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

      <View style={styles.buttonContainer}>
        <Button 
          title="Generate PDF" 
          onPress={generatePdf}
          color="#4a86e8"
        />
      </View>
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
  buttonContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});