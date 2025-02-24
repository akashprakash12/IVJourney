import * as React from "react";
import { useContext } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image } from "react-native";
import { ThemeContext } from "./context/ThemeContext";
import { AuthContext } from "./context/Authcontext"; // Ensure correct import

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
import AddPackageScreen from "./src/IndustryRep/Uploadpackage";
import Guiconponet from "./src/Splashscreens/Guiconponet";
import SplashScreen from "./src/Splashscreens/LoadingScreen";
import RequestForm from "./src/Admin/RequestForm";
import PDFPreview from "./src/HOD/RequestApprove";

// Icons
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";

// Import logo
import Logo from "./assets/icone.jpg";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function AppNavigation() {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={isDarkMode}>
      <Stack.Navigator initialRouteName="Splash">
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
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="PackageDetails" component={Package} />
        <Stack.Screen name="PackageUpload" component={PackageScreen} />
        <Stack.Screen name="Requistform" component={RequestForm} />
        <Stack.Screen name="Approveform" component={PDFPreview} />
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{
            headerTitle: () => (
              <Image
                source={Logo}
                style={{ width: 50, height: 50, borderRadius: 25 }}
                resizeMode="cover"
              />
            ),
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 🔹 Define the Tab Navigator with Dynamic Role-Based Tabs
function TabNavigator() {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";
  const { userRole } = useContext(AuthContext); // Get user role from AuthContext

  // 🌟 Common Tabs (Visible to All)
  const commonTabs = [
    <Tab.Screen
      key="HomeScreen"
      name="HomeScreen"
      component={HomeScreen}
      options={{
        title: "Home",
        tabBarIcon: ({ color }) => (
          <FontAwesome size={28} name="home" color={color} />
        ),
      }}
    />,
    <Tab.Screen
      key="Profile"
      name="Profile"
      component={Profile}
      options={{
        title: "Profile",
        tabBarIcon: ({ color }) => (
          <FontAwesome size={28} name="user" color={color} />
        ),
      }}
    />,
    <Tab.Screen
      key="Status"
      name="Status"
      component={Status}
      options={{
        title: "Status",
        tabBarIcon: ({ color }) => (
          <Ionicons name="notifications" size={24} color={color} />
        ),
      }}
    />,
    <Tab.Screen
      key="Location"
      name="Location"
      component={Location}
      options={{
        title: "Location",
        tabBarIcon: ({ color }) => (
          <FontAwesome6 name="location-dot" size={24} color={color} />
        ),
      }}
    />,
  ];

  // 🌟 Dynamic Tabs Based on Role
  let roleBasedTabs = [];

  if (userRole === "Industry Representative") {
    roleBasedTabs.push(
      <Tab.Screen
        key="IndustryDashboard"
        name="Industry Dashboard"
        component={AddPackageScreen}
        options={{
          title: "Upload",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="upload" color={color} />
          ),
        }}
      />
    );
  }

  if (userRole === "HOD") {
    roleBasedTabs.push(
      <Tab.Screen
        key="ApproveRequests"
        name="Approve Requests"
        component={PDFPreview}
        options={{
          title: "Approve",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="check-circle" color={color} />
          ),
        }}
      />
    );
  }

  if (userRole === "Student Leader") {
    roleBasedTabs.push(
      <Tab.Screen
        key="RequestForm"
        name="Request Form"
        component={RequestForm}
        options={{
          title: "Request",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 size={24} name="file-alt" color={color} />
          ),
        }}
      />
    );
  }

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
      {roleBasedTabs}
      {commonTabs}
    </Tab.Navigator>
  );
}
