// import React, { useState } from "react";
// import { View, Text, TouchableOpacity } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import SvgImage from "../assets/image1.svg"; // Import your SVG as a React component
// import { FlatList } from "react-native-gesture-handler";

// import Login from "./Login";


// const pages = [
 
//   { id: '2', component: <Login /> },
  
// ];
// export default function OnboardingScreen() {
//   const [currentPage, setCurrentPage] = useState(0);
//   const renderPage = ({ item }) => (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <SvgImage width={200} height={200} />
//       <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#E91E63', textAlign: 'center' }}>{item.title}</Text>
//       <Text style={{ fontSize: 16, color: '#424242', textAlign: 'center', marginTop: 10, marginHorizontal: 20 }}>{item.description}</Text>
//     </View>
//   );

//   return (
//     <LinearGradient
//       colors={["#ffffff", "#fce4ec"]}
//       className="flex-1 justify-between items-center px-5 py-10"
//     >
//       {/* Illustration */}
//       <View className="flex-3 justify-center items-center">
//         <SvgImage width={200} height={200} />
//       </View>

//       {/* Welcome Text */}
//       <Text className="text-2xl font-bold text-pink-600 text-center">
//         Welcome to IVJourney
//       </Text>
//       <Text className="text-base text-gray-700 text-center mt-2 px-4">
//         Experience seamless planning and management of industrial visits.
//         Bridging education with industry, one visit at a time.
//       </Text>

//       <FlatList
//         data={pages}
//         renderItem={renderPage}
//         keyExtractor={item => item.id}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         onScroll={({ nativeEvent }) => {
//           const currentIndex = Math.round(nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width);
//           setCurrentPage(currentIndex);
//         }}
//       />

//       {/* Bottom Dots Navigation */}
//       <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
//         {pages.map((_, index) => (
//           <View key={index} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: currentPage === index ? '#E91E63' : '#D1D1D1', marginHorizontal: 5 }} />
//         ))}
//       </View>

//       {/* Skip Button */}
//       <TouchableOpacity className="mt-5">
//         <Text className="text-pink-600 font-semibold">Skip</Text>
//       </TouchableOpacity>
//     </LinearGradient>
//   );
// }
import { View, Text } from 'react-native'
import React from 'react'

export default function Guiconponet() {
  return (
    <View>
      <Text>Guiconponet</Text>
    </View>
  )
}