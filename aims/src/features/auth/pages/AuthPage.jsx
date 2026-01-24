import { useState, useEffect } from "react";
import { useAuth } from "@/core/context/AuthContext";
import client from "@/core/api/client"; 
import { useNavigate } from "react-router-dom"; // <--- 1. Import this
import AuthEmailStep from "../components/AuthEmailStep";
import AuthOtpStep from "../components/AuthOtpStep";
import AuthRegisterStep from "../components/AuthRegisterStep";

export default function AuthPage() {
  const [step, setStep] = useState("EMAIL"); 
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState("student");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login, user } = useAuth(); 
  const navigate = useNavigate(); // <--- 2. Initialize hook

  // <--- 3. Auto-Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/"); // Sends to App.jsx -> HomeRoute -> Dashboard
    }
  }, [user, navigate]);

  // --- HANDLERS ---

  const handleSendOtp = async (inputEmail) => {
    setLoading(true);
    setError("");
    try {
      await client.post("/auth/send-otp", { email: inputEmail });
      setEmail(inputEmail);
      setStep("OTP");
    } catch (err) {
      if (err.response?.status === 404) {
         setError(err.response?.data?.msg || "Failed to send OTP.");
      } else {
         setError(err.response?.data?.msg || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (inputOtp) => {
    setLoading(true);
    setError("");
    try {
      await login(email, inputOtp);
      navigate("/"); // <--- 4. Redirect immediately on success
    } catch (err) {
      if (err.response?.status === 404 || err.response?.data?.code === "USER_NOT_FOUND") {
        setOtp(inputOtp); 
        setStep("REGISTER");
      } else {
        setError("Invalid Verification Code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    setLoading(true);
    setError("");
    try {
      await client.post("/auth/signup", { // Ensure endpoint matches api.js (signup vs register)
        email,
        otp, 
        role,
        ...formData
      });
      
      await login(email, otp);
      navigate("/"); // <--- 5. Redirect after registration
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {step === "EMAIL" && (
          <AuthEmailStep 
            onSubmit={handleSendOtp} 
            loading={loading} 
            error={error} 
          />
        )}

        {step === "OTP" && (
          <AuthOtpStep 
            email={email}
            onSubmit={handleVerifyOtp} 
            onResend={() => handleSendOtp(email)}
            onBack={() => setStep("EMAIL")}
            loading={loading} 
            error={error} 
          />
        )}

        {step === "REGISTER" && (
          <AuthRegisterStep
            email={email}
            role={role}
            setRole={setRole}
            onSubmit={handleRegister}
            loading={loading}
            error={error}
            onBack={() => setStep("OTP")}
          />
        )}
      </div>
    </div>
  );
}