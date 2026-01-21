import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp, signup } from "@/api/auth";
import { USER_ROLES, ROUTES } from '@/config/constants';
import EmailInput from '@/components/auth/EmailInput';
import OTPInput from '@/components/auth/OtpInput';
import NotFound from '@/components/auth/NotFound';
import Register from "@/components/auth/Register/Register";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [roleHint, setRoleHint] = useState(null);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();  // <-- cookie-based session updater

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await sendOtp(email);
      if (res.success) setStep("otp");
      else alert(res.msg || "Failed to send OTP");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  const handleVerifyOTP = async (otp) => {
    try {
      const res = await verifyOtp(email, otp);

      if (res.user_exists) {
        // backend has already set HttpOnly cookie with token
        // IMPORTANT: refresh session BEFORE redirect so dashboard gets user context
        await refreshUser();
        redirectToDashboard(res.role);
        return;
      }

      // NEW USER SIGNUP FLOW
      setRoleHint(res.role_hint);
      setStep("register");

    } catch (err) {
      console.error(err);
      alert("Invalid or expired OTP");
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await sendOtp(email);
      if (!res.success) alert("Failed to resend OTP");
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    }
  };

  const redirectToDashboard = (userRole) => {
    switch (userRole) {
      case USER_ROLES.STUDENT:
        navigate(ROUTES.STUDENT_DASHBOARD);
        break;
      case USER_ROLES.INSTRUCTOR:
        navigate(ROUTES.INSTRUCTOR_DASHBOARD);
        break;
      case USER_ROLES.FACULTY_ADVISOR:
        navigate(ROUTES.ADVISOR_DASHBOARD);
        break;
      default:
        navigate(ROUTES.HOME);
    }
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      
      {/* LEFT BACKGROUND - Image */}
      <div
        className="hidden lg:block w-1/2 h-full bg-cover bg-center"
        style={{ backgroundImage: `url('/bg.jpg')` }}
      >
        <div className="w-full h-full bg-white/10 backdrop-brightness-105"></div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        {step === "email" && (
          <EmailInput 
            email={email}
            setEmail={setEmail}
            handleSubmit={handleSubmit}
          />
        )}

        {step === "otp" && (
          <OTPInput
            email={email}
            handleBack={() => setStep("email")}
            handleVerify={handleVerifyOTP}
            handleSendOtpAgain={handleResendOtp}
          />
        )}

        {step === "register" && (
          <Register
            email={email}
            roleHint={roleHint}
            onBack={() => setStep("email")}
            onComplete={async (role, data) => {
              try {
                const res = await signup({ email, role, data });
                if (res.success) {
                  await refreshUser(); // <-- session refresh
                  redirectToDashboard(role);
                } else {
                  alert(res.msg || "Signup failed");
                }
              } catch (err) {
                console.error(err);
                alert("Signup failed");
              }
            }}
          />
        )}

        {/* NOTE: not-found is skipped since backend handles existence */}
      </div>
    </div>
  );
}

/*
IMPORTANT EXPLANATION YOU WANTED MENTIONED:

When using HTTP-only cookies for auth:
- the cookie MUST be set on backend origin (e.g., http://localhost:5000)
- do NOT call backend APIs through frontend origin (e.g., fetch("/auth/...")) or the cookie
  will be stored on http://localhost:5173 instead of http://localhost:5000 and backend will
  never receive it, resulting in 401 on /auth/me.
The correct way is to call backend through axios with baseURL = http://localhost:5000
so cookies store on backend origin and are sent automatically with credentials.
*/
