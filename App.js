import * as React from "react";
import { useContext } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Image } from "react-native";
import { ThemeProvider, ThemeContext } from "./context/ThemeContext";

// Import logo
import Logo from "./assets/icone.jpg";

// Import Screens
import Login from "./src/Login";
import Register from "./src/Register";

import Bookmark from "./src/app/Bookmark";
import Profile from "./src/app/Profile";
import Status from "./src/app/Status";
import Location from "./src/app/Location";
import HomeScreen from "./src/app/Home";
import Package from "./src/app/package/[id]";
import PackageScreen from "./src/IndustryRep/Uploadpackage";

// Icons
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import Guiconponet from "./src/Splashscreens/Guiconponet";
import SplashScreen from "./src/Splashscreens/LoadingScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 🔹 Function to Get Theme & Apply Navigation Theme
function AppNavigation() {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={isDarkMode}>
      <Stack.Navigator initialRouteName="Register">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Gui"
          component={Guiconponet}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="PackageDetails" component={Package} />
        <Stack.Screen name="PackageUpload" component={PackageScreen} />
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{
            headerTitle: () => (
              <Image
                source={Logo}
                style={{ width: 50, height: 50, borderRadius: 25 }} // Ensure a perfect circle
                resizeMode="cover"
              />
            ),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 🔹 Define the Tab Navigator with Theme Support
function TabNavigator() {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? "#1C1C1E" : "#F22E63",
          height: 60,
        },
        tabBarActiveTintColor: isDarkMode ? "#FFF" : "white",
        tabBarInactiveTintColor: isDarkMode ? "#888" : "#FF6480",
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookmark"
        component={Bookmark}
        options={{
          title: "Bookmark",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="bookmark" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Status"
        component={Status}
        options={{
          title: "Status",
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Location"
        component={Location}
        options={{
          title: "Location",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="location-dot" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// 🔹 Wrap App with ThemeProvider
export default function App() {
  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppNavigation />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
