import React, { createContext, useState } from "react";

// Create Auth Context
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Function to handle login
  const login = (role, token) => {
    setUserToken(token);
    setUserRole(role);
  };

  // Function to handle logout
  const logout = () => {
    setUserToken(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
