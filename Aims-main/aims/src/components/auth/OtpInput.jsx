import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";

function OTPInput({ email, handleVerify, handleBack , handleSendOtpAgain  }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const refs = useRef([]);

  const [timeLeft, setTimeLeft] = useState(60);

  // TIMER LOGIC
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) refs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      refs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").slice(0, 6);
    if (!/^[0-9]+$/.test(data)) return;

    const arr = data.split("");
    setOtp(arr);
    refs.current[Math.min(arr.length - 1, 5)].focus();
  };

  const handleResend = () => {
  setOtp(Array(6).fill(""));
  handleSendOtpAgain();
  setTimeLeft(60);
};

  return (
    <div className="w-full md:w-1/2 h-full flex flex-col justify-center bg-white px-8 md:px-16 lg:px-24 box-border">

      {/* BACK BUTTON */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-black/80 transition mb-6"
      >
        ← Back
      </button>

      <div className="max-w-sm mx-auto">

        {/* ICON */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <span className="text-white text-2xl">🔒</span>
          </div>
        </div>

        {/* HEADING */}
        <h1 className="text-3xl font-semibold text-center mb-2">
          Verify Your Email
        </h1>

        {/* SUBTEXT */}
        <p className="text-gray-600 text-center mb-6">
          Enter the 6-digit code sent to <br />
          <span className="font-medium">{email}</span>
        </p>

        {/* OTP BOXES */}
        <div
          className="flex justify-center gap-3 mb-6"
          onPaste={handlePaste}
        >
          {otp.map((val, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              type="text"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-12 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        {/* TIMER */}
        <div className="text-center mb-4 text-gray-500">
          Time remaining: <span className="text-purple-600">{formatTime(timeLeft)}</span>
        </div>

        {/* RESEND */}
        <div className="flex justify-center mb-6">
        <Button
          disabled={timeLeft > 0}
          onClick={handleResend}
          className="bg-black text-white hover:bg-black/80 disabled:opacity-50"
        >
          Resend Code
        </Button>
      </div>


        {/* VERIFY */}
        <Button
          onClick={() => handleVerify(otp.join(""))}
          disabled={otp.join("").length !== 6}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white"
        >
          Verify OTP
        </Button>
      </div>
    </div>
  );
}

export default OTPInput;
