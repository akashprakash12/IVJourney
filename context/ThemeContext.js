import React, { createContext, useState, useEffect } from "react";
import { Appearance } from "react-native";

// Create Theme Context
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemTheme = Appearance.getColorScheme(); // Get system theme
  const [theme, setTheme] = useState(systemTheme || "light"); // Default to system theme

  // Listen for theme changes in system settings
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
