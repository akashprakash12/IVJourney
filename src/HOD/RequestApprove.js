import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import { printToFileAsync } from "expo-print";
import * as Sharing from "expo-sharing";

export default function PDFPreview({ route }) {
  const { industryName = "N/A", visitDate = "N/A", purpose = "N/A" } = route.params || {};
  const [pdfUri, setPdfUri] = useState(null);
  const [loading, setLoading] = useState(true);

  const generatePDF = async () => {
    const sealImage = "https://upload.wikimedia.org/wikipedia/commons/6/6e/Official_Seal.svg"; // Replace with your institution's seal if available

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #F22E63; text-align: center; }
            .container { border: 1px solid #ddd; padding: 15px; margin-top: 20px; }
            .signature-container { display: flex; justify-content: space-between; margin-top: 50px; }
            .signature-box { width: 40%; text-align: center; border-top: 1px solid black; padding-top: 5px; }
            .seal-container { text-align: center; margin-top: 30px; }
            .seal { width: 100px; height: 100px; opacity: 0.5; }
          </style>
        </head>
        <body>
          <h2>Industry Visit Approval Form</h2>
          <div class="container">
            <p><strong>Industry Name:</strong> ${industryName}</p>
            <p><strong>Visit Date:</strong> ${visitDate}</p>
            <p><strong>Purpose:</strong> ${purpose}</p>
            <p><strong>Approval Status:</strong> Approved</p>
          </div>

          <!-- Signatures -->
          <div class="signature-container">
            <div class="signature-box">
              <p>HOD Signature</p>
            </div>
            <div class="signature-box">
              <p>Faculty Signature</p>
            </div>
          </div>

          <!-- Official Seal -->
          <div class="seal-container">
            <p>Official Seal</p>
            <img class="seal" src="${sealImage}" alt="Seal">
          </div>
        </body>
      </html>
    `;

    const file = await printToFileAsync({
      html,
      base64: false,
    });

    setPdfUri(file.uri);
    setLoading(false);
  };

  useEffect(() => {
    generatePDF();
  }, []);

  const handleDownload = async () => {
    if (pdfUri) {
      await Sharing.shareAsync(pdfUri);
    }
  };

  return (
    <View className="flex-1 p-5 bg-white">
      <Text className="text-2xl font-bold text-center text-pink-500">
        PDF Preview
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#f43f5e" />
      ) : (
        <WebView source={{ uri: pdfUri }} style={{ flex: 1, marginTop: 10 }} />
      )}

      <View className="items-center">
        <TouchableOpacity className="w-3/4 mt-5 rounded-full overflow-hidden" onPress={handleDownload}>
          <LinearGradient colors={["#FF6480", "#F22E63"]} start={[0, 0]} end={[1, 0]} className="p-4 items-center rounded-full">
            <Text className="text-white font-bold">Download PDF</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
