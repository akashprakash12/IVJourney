import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { useState, useRef, useContext } from "react";
import PagerView from "react-native-pager-view";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeContext } from "../../context/ThemeContext";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: 1,
    image: require("../../assets/Onboarding-1.png"),
    title: "Welcome to IVJourney",
    description:
      "Experience seamless planning and management of industrial visits. Bridging education with industry, one visit at a time.",
  },
  {
    id: 2,
    image: require("../../assets/Onboarding-2.png"),
    title: "Plan & Organize",
    description:
      "Easily schedule visits and stay updated with industry interactions and educational tours.",
  },
  {
    id: 3,
    image: require("../../assets/Onboarding-3.png"),
    title: "Plan & Keep Everyone Informed",
    description:
      "Easily schedule and communicate with students, staff, and industries in one place for a smooth experience.",
  },
];

export default function OnboardingScreen({ navigation }) {
  const [page, setPage] = useState(0);
  const pagerRef = useRef(null);
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  return (
    <View className={isDarkMode ? "bg-gray-900 flex-1" : "bg-white flex-1"}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(event) => setPage(event.nativeEvent.position)}
      >
        {onboardingData.map((item, index) => (
          <View key={item.id} className="flex-1 items-center justify-center px-5">
            <Image
              source={item.image}
              style={{ width: width * 0.8, height: height * 0.4, resizeMode: "contain" }}
            />
            <Text className={`text-2xl font-bold mt-5 ${isDarkMode ? "text-white" : "text-pink-500"}`}>
              {item.title}
            </Text>
            <Text className={`text-center text-lg mt-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              {item.description}
            </Text>

            {/* Pagination Dots */}
            <View className="flex-row mt-5">
              {onboardingData.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setPage(i);
                    pagerRef.current?.setPage(i);
                  }}
                >
                  <View
                    className={`w-3 h-3 rounded-full mx-1 ${i === page ? "bg-pink-500" : "bg-gray-400"}`}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Navigation Buttons */}
            {index === onboardingData.length - 1 ? (
              <View className="items-center">
                <TouchableOpacity className="w-3/4 mt-5 rounded-full overflow-hidden" onPress={() => navigation.replace("Login")}>
                  <LinearGradient
                    colors={["#FF6480", "#F22E63"]}
                    start={[0, 0]}
                    end={[1, 0]}
                    className="p-4 items-center rounded-full"
                  >
                    <Text className="text-white font-bold">Get Started</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="items-center">
                <TouchableOpacity className="w-3/4 mt-5 rounded-full overflow-hidden" onPress={() => navigation.replace("Login")}>
                  <LinearGradient
                    colors={["#FF6480", "#F22E63"]}
                    start={[0, 0]}
                    end={[1, 0]}
                    className="p-4 items-center rounded-full"
                  >
                    <Text className="text-white font-bold">Skip</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </PagerView>
    </View>
  );
}