import { useState, useEffect, useRef } from "react";
import { KeyRound, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AuthOtpStep({ email, onSubmit, onResend, onBack, loading, error }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(60);
  const refs = useRef([]);

  // Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Handlers
  const handleResend = () => {
    setOtp(Array(6).fill(""));
    setTimeLeft(60);
    onResend();
  };

  const handleChange = (val, index) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) refs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      refs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.join("").length === 6) onSubmit(otp.join(""));
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      {/* Header Section */}
      <CardHeader className="text-center pb-6 relative px-0">
        <button 
          onClick={onBack} 
          className="absolute left-0 top-0 p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          title="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4 ring-4 ring-white shadow-sm">
          <KeyRound size={24} />
        </div>
        
        <CardTitle className="text-2xl font-bold text-slate-900">
          Verify It's You
        </CardTitle>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          We sent a 6-digit code to <br/>
          <span className="font-semibold text-slate-800">{email}</span>
        </p>
      </CardHeader>

      <CardContent className="px-0">
        {error && (
           <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>{error}
           </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, i) => (
              <Input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm rounded-lg"
                disabled={loading}
              />
            ))}
          </div>

          <div className="space-y-4">
            {/* Verify Button */}
             <Button 
               type="submit" 
               className="w-full h-11 text-sm font-semibold bg-slate-900 hover:bg-slate-800 shadow-md transition-all" 
               disabled={otp.join("").length !== 6 || loading}
             >
               {loading ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                 </>
               ) : (
                 "Verify & Continue"
               )}
             </Button>

             {/* Resend Link */}
             <div className="text-center">
                <button 
                  type="button" 
                  onClick={handleResend}
                  disabled={timeLeft > 0 || loading}
                  className="text-xs font-medium text-slate-500 hover:text-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 w-full transition-colors"
                >
                  <RefreshCw size={12} className={timeLeft > 0 ? "animate-spin" : ""} />
                  {timeLeft > 0 ? `Resend code in ${timeLeft}s` : "Resend Verification Code"}
                </button>
             </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}