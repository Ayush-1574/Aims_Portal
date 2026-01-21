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
    <div className="w-full flex flex-col justify-center bg-white px-8 md:px-16 box-border">

      {/* BACK BUTTON */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition mb-6 w-fit"
      >
        ← Back
      </button>

      <div className="max-w-md mx-auto">

        {/* ICON */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white text-4xl">🔐</span>
          </div>
        </div>

        {/* HEADING */}
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          Verify Your Email
        </h1>

        {/* SUBTEXT */}
        <p className="text-gray-600 text-center mb-8">
          Enter the 6-digit code sent to <br />
          <span className="font-semibold text-gray-800">{email}</span>
        </p>

        {/* OTP BOXES */}
        <div
          className="flex justify-center gap-3 mb-8"
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
              className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          ))}
        </div>

        {/* TIMER */}
        <div className="text-center mb-6">
          <span className="text-gray-600">Time remaining: </span>
          <span className={`font-bold text-lg ${timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* VERIFY */}
        <Button
          onClick={() => handleVerify(otp.join(""))}
          disabled={otp.join("").length !== 6}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all mb-4 disabled:opacity-50"
        >
          ✓ Verify OTP
        </Button>

        {/* RESEND */}
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-3">Didn't receive the code?</p>
          <Button
            disabled={timeLeft > 0}
            onClick={handleResend}
            className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium disabled:opacity-50 h-10"
          >
            {timeLeft > 0 ? `Resend in ${timeLeft}s` : '🔄 Resend Code'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OTPInput;
