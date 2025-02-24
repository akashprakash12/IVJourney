import * as React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/Authcontext"; // Import AuthProvider
import AppNavigation from "./AppNavigation"; // Move AppNavigation to a separate file

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppNavigation /> //hello
        </GestureHandlerRootView>
      </ThemeProvider>
    </AuthProvider>
  );
}
