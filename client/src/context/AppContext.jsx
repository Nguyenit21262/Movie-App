import { useState, createContext, useEffect } from "react";
import axios from "axios";

export const AppContent = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // set cookie credentials
  axios.defaults.withCredentials = true;

  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);

      if (data.success) {
        setUserData(data.userData);
        return data.userData; // return user object
      }

      return null;
    } catch (error) {
      console.error("Get user data error:", error);
      setUserData(null);
      return null;
    }
  };
  const getAuthState = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);

      if (data.success) {
        setIsLoggedIn(true);
        await getUserData();
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("Auth state error:", error);
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  // run when app start
  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,

    isLoggedIn,
    setIsLoggedIn,

    userData,
    setUserData,

    getUserData,
    getAuthState,

    loading,
  };

  return <AppContent.Provider value={value}>{children}</AppContent.Provider>;
};
