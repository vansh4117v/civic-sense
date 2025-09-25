import { useState, useEffect, createContext, useContext } from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  isAuthenticated as checkAuth,
} from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = () => {
      const currentUser = getCurrentUser();
      const isAuth = checkAuth();

      if (currentUser && isAuth) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (phoneNumber, password, rememberMe = false) => {
    const response = await apiLogin(phoneNumber, password, rememberMe);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
