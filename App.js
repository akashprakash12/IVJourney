import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/Authcontext';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigation from './AppNavigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <PaperProvider>
            <AppNavigation />
          </PaperProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}