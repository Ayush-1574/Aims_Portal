import { useState, useEffect } from "react";
import { useAuth } from "@/core/context/AuthContext";
import client from "@/core/api/client"; 
import { useNavigate } from "react-router-dom"; 
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
  const navigate = useNavigate();

  // --- Auto-Redirect ---
  useEffect(() => {
    if (user) {
      navigate("/");
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
      navigate("/");
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
      await client.post("/auth/signup", { 
        email,
        otp, 
        role,
        ...formData
      });
      
      await login(email, otp);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      
      {/* --- LEFT SIDE: Image Section --- */}
      <div className="hidden lg:block relative h-full w-full bg-slate-900 overflow-hidden">
        {/* Campus Image */}
        <img 
          src="/bg.jpg" 
          alt="Campus Background" 
          className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-[20s] hover:scale-105"
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

        {/* Branding Text */}
        <div className="absolute bottom-0 left-0 p-12 text-white z-10">
          <div className="flex items-center gap-4 mb-6">
             {/* --- UPDATED: IIT Ropar Logo --- */}
             <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20 shadow-xl">
               <img 
                 src="/header-logo.png" 
                 alt="IIT Ropar Logo" 
                 className="h-16 w-auto object-contain drop-shadow-md" 
               />
             </div>
             
             <div>
               <h1 className="text-3xl font-bold tracking-tight text-white leading-none">AIMS Portal</h1>
               <p className="text-sm text-slate-300 font-medium mt-1 tracking-wide uppercase opacity-80">
                 Indian Institute of Technology Ropar
               </p>
             </div>
          </div>
          
          <p className="text-slate-300 text-lg max-w-md leading-relaxed border-l-2 border-blue-500 pl-4">
            Welcome to the Academic Information Management System. 
            Manage your courses, grades, and academic profile seamlessly.
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: Form Section --- */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
    </div>
  );
}