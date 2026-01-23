import { useState, useEffect, useRef } from "react";
import { KeyRound, ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AuthOtpStep({ email, onSubmit, onResend, onBack, loading, error }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(60);
  const refs = useRef([]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

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
    <Card className="border-white/40 shadow-2xl backdrop-blur-xl bg-white/80">
      <CardHeader className="text-center pb-2 relative">
        <button onClick={onBack} className="absolute left-6 top-6 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-purple-500/20">
          <KeyRound size={32} />
        </div>
        <CardTitle className="text-3xl font-bold text-slate-800">Verify Identity</CardTitle>
        <p className="text-slate-500 mt-2 text-sm">
          Enter the code sent to <span className="font-bold text-slate-700">{email}</span>
        </p>
      </CardHeader>

      <CardContent className="p-8 pt-6">
        {error && (
           <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-3 animate-fade-in">
             <div className="w-2 h-2 rounded-full bg-red-500"></div>{error}
           </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, i) => (
              <Input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-slate-50 border-slate-200 focus:ring-purple-500/20 focus:border-purple-500"
                disabled={loading}
              />
            ))}
          </div>

          <div className="space-y-4">
             <Button 
               type="submit" 
               className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-500/25" 
               disabled={otp.join("").length !== 6 || loading}
               isLoading={loading}
             >
               Verify & Login
             </Button>

             <div className="text-center">
                <button 
                  type="button" 
                  onClick={handleResend}
                  disabled={timeLeft > 0 || loading}
                  className="text-sm font-semibold text-slate-500 hover:text-purple-600 disabled:opacity-50 flex items-center justify-center gap-2 w-full"
                >
                  <RefreshCw size={14} className={timeLeft > 0 ? "animate-spin" : ""} />
                  {timeLeft > 0 ? `Resend code in ${timeLeft}s` : "Resend Verification Code"}
                </button>
             </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}