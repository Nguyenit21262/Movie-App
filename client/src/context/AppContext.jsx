import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../api/httpClient";
import { logoutUserRequest } from "../api/authApi";
import { getCurrentUser } from "../api/userApi";
import { AppContent } from "./AppContent";

export const AppContextProvider = ({ children }) => {
  const backendUrl = API_BASE_URL;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserData = useCallback(async () => {
    try {
      const { data } = await getCurrentUser();

      if (data.success) {
        setUserData(data.userData);
        setIsLoggedIn(true);
        return data.userData;
      }

      setUserData(null);
      setIsLoggedIn(false);
      return null;
    } catch {
      setUserData(null);
      setIsLoggedIn(false);
      return null;
    }
  }, []);

  const getAuthState = useCallback(async () => {
    try {
      setLoading(true);
      await getUserData();
    } finally {
      setLoading(false);
    }
  }, [getUserData]);

  const logoutUser = async () => {
    try {
      await logoutUserRequest();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUserData(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    getAuthState();
  }, [getAuthState]);

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    userData,
    setUserData,
    getUserData,
    getAuthState,
    logoutUser,
    loading,
  };

  return <AppContent.Provider value={value}>{children}</AppContent.Provider>;
};
