import React, { createContext, useState } from "react";

// Create Auth Context
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userDetails, setUserDetails] = useState(null); // Store user details

  // Function to handle login
  const login = (role, token, details) => {
    setUserToken(token);
    setUserRole(role);
    setUserDetails(details); // Store user details
  };

  // Function to handle logout
  const logout = () => {
    setUserToken(null);
    setUserRole(null);
    setUserDetails(null); // Clear user details
  };

  return (
    <AuthContext.Provider value={{ userToken, userRole, userDetails, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
