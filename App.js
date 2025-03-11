import * as React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/Authcontext";
import AppNavigation from "./AppNavigation";
import { Provider as PaperProvider } from "react-native-paper";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PaperProvider> {/* Wrap your app inside PaperProvider */}
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppNavigation />
          </GestureHandlerRootView>
        </PaperProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
