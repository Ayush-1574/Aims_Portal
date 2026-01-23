import { createContext, useContext, useState, useEffect } from "react";
import client from "@/core/api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on page load
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // We'll define this endpoint in the Auth Feature later
      const res = await client.get("/auth/me");
      setUser(res.data.user);
    } catch (error) {
      console.error("Session expired:", error);
      sessionStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, otp) => {
    // We'll use the proper API function in the Login page, 
    // but this sets the state manually after success.
    const res = await client.post("/auth/verify-otp", { email, otp });
    sessionStorage.setItem("token", res.data.token);
    
    // Fetch full user details immediately
    // Or if verify-otp returns the user, just set it:
    // setUser(res.data.user || { email, role: res.data.role }); 
    
    // For now, let's re-fetch to be safe:
    await checkUser();
    return res.data;
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
    // Optional: Call backend logout
    client.post("/auth/logout").catch(() => {}); 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);