import { createContext, useContext, useState, useEffect } from "react";
import { getMe, logout as logoutApi } from "@/api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // <-- IMPORTANT

  const refreshUser = async () => {
    setLoading(true);
    try {
      const res = await getMe();
      // backend returns: { success, user }
      console.log(res)
      setUser(res.user || null);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser(); // load user on refresh
  }, []);

  const logout = async () => {
    await logoutApi();
    setUser(null);
    window.location = "/login"; // redirect to login
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
