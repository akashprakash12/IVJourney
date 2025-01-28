import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Login from "./src/Login";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import Register from "./src/Register";

import OnboardingScreen from "./src/Guiconponet";
import { Image } from "react-native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
// Import logo
import Logo from "./assets/logo.png";
import Bookmark from "./src/app/Bookmark";
import Profile from "./src/app/Profile";
import Status from "./src/app/Status";
import Location from "./src/app/Location";
import HomeScreen from "./src/app/Home";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Define the Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
    initialRouteName="Location"
      screenOptions={{
        headerShown: false, // Hide header for tab screens
        tabBarStyle: { backgroundColor: '#F22E63', height: 60 },
        tabBarActiveTintColor: 'white', // Set active tab color (icon and text)
    tabBarInactiveTintColor: '#FF6480', // Set inactive tab color (icon and text)
    tabBarLabelStyle: { fontSize: 12 },  // Customize tab bar
      }}
    >
      <Tab.Screen name="Profile"  component={Profile} options={{title:"Profile", tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />}} />
      <Tab.Screen name="Bookmark" component={Bookmark} options={{title:"Bookmark", tabBarIcon: ({ color }) => <FontAwesome size={28} name="bookmark" color={color} />}}  />
      <Tab.Screen name="HomeScreen" component={HomeScreen} options={{title:"Home", tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />}} />
      <Tab.Screen name="Status" component={Status} options={{title:"Status", tabBarIcon: ({ color }) => <Ionicons name="notifications" size={24} color={color} />}}  />
      <Tab.Screen name="Location" component={Location} options={{title:"Location", tabBarIcon: ({ color }) => <FontAwesome6 name="location-dot" size={24} color={color} />}} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Gui" component={OnboardingScreen}  />
          <Stack.Screen name="Register" component={Register}  options={{headerShown:false}}/>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen
            name="Home"
            component={TabNavigator}
            options={{
              headerTitle: () => (
                <Image
                  source={Logo} // Reference the logo
                  style={{ width: 100, height: 40 }} // Set size of the logo
                  resizeMode="contain" // Make sure the logo scales correctly
                />
              ),
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
