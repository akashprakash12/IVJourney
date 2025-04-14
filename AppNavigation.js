import * as React from "react";
import { useContext, useEffect } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BackHandler, Image, TouchableOpacity } from "react-native";
import { ThemeContext } from "./context/ThemeContext";
import { AuthContext } from "./context/Authcontext";
import { Menu, Divider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Screens
import Login from "./src/Login";
import ForgotPassword from "./src/ForgotPassword";
import Register from "./src/Register";
import ResetPassword from "./src/ResetPassword";


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
import StudentRequist from "./src/Student/StudentRequist";
import VotedPersonsScreen from "./src/Student/VotedPersonsScreen";
import Studentstatus from "./src/Student/Studentstatus";


// Icons
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";

// Logo
import Logo from "./assets/icone.jpg";

// import ResetPassword from "./src/ResetPassword";
// import ForgotPassword from "./src/Forgotpassword";


const RootStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
function HeaderMenu({ logout }) {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = React.useState(false);

  return (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginRight: 15 }}>
          <MaterialIcons name="more-vert" size={24} color="black" />
        </TouchableOpacity>
      }
    >
      <Menu.Item 
        onPress={() => {
          // Navigate to the Tabs screen with Profile as initial route
          navigation.navigate("Tabs", { screen: "Profile" });
          setMenuVisible(false);
        }} 
        title="Profile" 
      />
      <Divider />
      <Menu.Item
        onPress={() => {
          logout();
          setMenuVisible(false);
        }}
        title="Logout"
      />
    </Menu>
  );
}
function TabNavigator() {
  const { theme } = useContext(ThemeContext);
  const { userRole } = useContext(AuthContext);
  const isDarkMode = theme === "dark";

  const commonTabs = [
    {
      name: "Home",
      component: HomeScreen,
      icon: (color) => <FontAwesome size={28} name="home" color={color} />
    },
    {
      name: "Profile",
      component: Profile,
      icon: (color) => <FontAwesome size={28} name="user" color={color} />
    },
    {
      name: "Status",
      component: Status,
      icon: (color) => <Ionicons name="notifications" size={24} color={color} />
    },
    {
      name: "Location",
      component: Location,
      icon: (color) => <FontAwesome6 name="location-dot" size={24} color={color} />
    }
  ];

  const roleBasedTabs = {
    "Industry Representative": [{
      name: "IndustryDashboard",
      component: AddPackageScreen,
      title: "Upload",
      icon: (color) => <FontAwesome size={28} name="upload" color={color} />
    }],
    "Student": [{
      name: "StudentDashboard",
      component: StudentRequist,
      title: "Upload",
      icon: (color) => <FontAwesome size={28} name="upload" color={color} />
    }],
    "HOD": [{
      name: "ApproveRequests",
      component: PDFPreview,
      title: "Approve",
      icon: (color) => <FontAwesome size={28} name="check-circle" color={color} />
    }],
    "Student Leader": [{
      name: "RequestForm",
      component: RequestForm,
      title: "Request",
      icon: (color) => <FontAwesome6 size={24} name="file-alt" color={color} />
    }]
  };

  return (
    <Tab.Navigator
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
      {roleBasedTabs[userRole]?.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => tab.icon(color)
          }}
        />
      ))}
      {commonTabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            title: tab.name,
            tabBarIcon: ({ color }) => tab.icon(color)
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

function MainNavigator() {
  const { logout } = useContext(AuthContext);

  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="Tabs"
        component={TabNavigator}
        options={({ navigation }) => ({
          headerTitle: () => (
            <Image
              source={Logo}
              style={{ width: 50, height: 50, borderRadius: 25 }}
              resizeMode="cover"
            />
          ),
          headerRight: () => <HeaderMenu logout={logout} />,
          headerLeft: () => null,
        })}
      />
      <MainStack.Screen 
        name="VotedPersons" 
        component={VotedPersonsScreen} 
        options={{ headerShown: true }}
      />
      <MainStack.Screen 
        name="PackageDetails" 
        component={Package} 
        options={{ headerShown: true }}
      />
      <MainStack.Screen 
        name="PackageUpload" 
        component={PackageScreen} 
        options={{ headerShown: true }}
      />
      <MainStack.Screen 
        name="Requistform" 
        component={RequestForm} 
        options={{ headerShown: true }}
      />
      
      <MainStack.Screen 
        name="Approveform" 
        component={PDFPreview} 
        options={{ headerShown: true }}
      />
      <MainStack.Screen 
        name="StudnetStatus" 
        component={Studentstatus} 
        options={{ headerShown: true }}
      />
      
    </MainStack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Splash" component={SplashScreen} />
      <MainStack.Screen name="Gui" component={Guiconponet} />
      <MainStack.Screen name="Login" component={Login} />
      <MainStack.Screen name="Register" component={Register} />
      <MainStack.Screen name="ForgotPassword" component={ForgotPassword} />
      <MainStack.Screen name="ResetPassword" component={ResetPassword} />
    </MainStack.Navigator>
  );
}

export default function AppNavigation() {
  const { theme } = useContext(ThemeContext);
  const { userDetails } = useContext(AuthContext);
  const isDarkMode = theme === "dark" ? DarkTheme : DefaultTheme;

  useEffect(() => {
    const backAction = () => {
      if (userDetails) {
        return true; // Prevent going back if logged in
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [userDetails]);

  return (
    <NavigationContainer theme={isDarkMode}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {userDetails ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}