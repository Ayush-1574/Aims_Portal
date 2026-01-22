import { createContext, useContext, useState, useEffect } from "react";
import { getMe, logout as logoutApi } from "@/api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    try {
      console.log("[AuthContext] Calling /auth/me to refresh user...");
      const res = await getMe();
      console.log("[AuthContext] Response:", res);
      
      if (res.success && res.user) {
        console.log("[AuthContext] User authenticated:", res.user?.email, res.user?.role);
        setUser(res.user);
        // Store token in sessionStorage for per-tab isolation
        if (res.token) {
          sessionStorage.setItem("token", res.token);
          console.log("[AuthContext] Token stored in sessionStorage");
        }
      } else {
        console.log("[AuthContext] Auth failed:", res.msg);
        setUser(null);
        sessionStorage.removeItem("token");
      }
    } catch (err) {
      console.error("[AuthContext] Failed to refresh user:", err.message);
      console.error("[AuthContext] Error response:", err.response?.data || err.response?.status);
      setUser(null);
      sessionStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser(); // load user on mount
  }, []);

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    sessionStorage.removeItem("token");
    window.location = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
