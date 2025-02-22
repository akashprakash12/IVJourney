import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { useState, useRef } from "react";
import PagerView from "react-native-pager-view";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: 1,
    image: require("../../assets/Onboarding-1.png"),
    title: "Welcome to IVJourney",
    description: "Experience seamless planning and management of industrial visits. Bridging education with industry, one visit at a time."
  },
  {
    id: 2,
    image: require("../../assets/Onboarding-2.png"),
    title: "Plan & Organize",
    description: "Easily schedule visits and stay updated with industry interactions and educational tours."
  },
  {
    id: 3,
    image: require("../../assets/Onboarding-3.png"),
    title: "Plan & Keep Everyone Informed",
    description: "Easily schedule Communicate with students, staff, and industries in one place for a smooth experience. and stay updated with industry interactions and educational tours."
  }
];

export default function OnboardingScreen({ navigation }) {
  const [page, setPage] = useState(0);
  const pagerRef = useRef(null); // ✅ Reference for PagerView

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <PagerView
        ref={pagerRef} 
        style={{ flex: 1 }} // ✅ Ensure flex:1
        initialPage={0}
        onPageSelected={(event) => setPage(event.nativeEvent.position)}
      >
        {onboardingData.map((item, index) => (
          <View key={item.id} style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 }}>
            <Image source={item.image} style={{ width: width * 0.8, height: height * 0.4, resizeMode: "contain" }} />
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#f43f5e", marginTop: 20 }}>{item.title}</Text>
            <Text style={{ fontSize: 16, textAlign: "center", color: "#333", marginTop: 10 }}>{item.description}</Text>

            {/* Pagination Dots */}
            <View style={{ flexDirection: "row", marginTop: 20 }}>
              {onboardingData.map((_, i) => (
                <TouchableOpacity 
                  key={i} 
                  onPress={() => {
                    setPage(i);
                    pagerRef.current?.setPage(i); // ✅ Set page manually
                  }}
                >
                  <View style={{
                    width: 10, height: 10, borderRadius: 5,
                    backgroundColor: i === page ? "#f43f5e" : "#ddd",
                    marginHorizontal: 5
                  }} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Navigation Buttons */}
            {index === onboardingData.length - 1 ? (
              <TouchableOpacity onPress={() => navigation.replace("Home")} style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#f43f5e" }}>Get Started</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => navigation.replace("Home")} style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#f43f5e" }}>Skip</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </PagerView>
    </View>
  );
}
