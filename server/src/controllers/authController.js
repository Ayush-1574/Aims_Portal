import User from "../models/Auth/UserModel.js";
import Otp from "../models/Auth/OtpModel.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/email.js";

// Helper: extract base email (before + modifier)
const getBaseEmail = (email) => {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const localPart = parts[0].split("+")[0];
  return `${localPart}@${parts[1]}`;
};

// Common cookie options
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false, // true in production (HTTPS)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// 1️⃣ SEND OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, msg: "Email required" });
    }

    if (!email.endsWith("@gmail.com") && !email.endsWith("@iitrpr.ac.in")) {
      return res
        .status(400)
        .json({ success: false, msg: "Only IIT Ropar emails allowed" });
    }

    const baseEmail = getBaseEmail(email);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email: baseEmail });

    await Otp.create({
      email: baseEmail,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmail({
      to: baseEmail,
      subject: "Your AIMS Portal OTP Code",
      html: `
        <div style="font-family:Arial;font-size:16px;">
          <p>Your OTP code is:</p>
          <h2 style="letter-spacing:3px;">${otp}</h2>
          <p>This code expires in 5 minutes.</p>
          <br/>
          <p>AIMS Portal</p>
        </div>
      `,
    });

    return res.json({ success: true, otp_sent: true });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

// 2️⃣ VERIFY OTP (LOGIN)
export const verifyOtp = async (req, res) => {
  try {
    const { email,otp } = req.body;

    // OTP verification skipped (as in your original code)
    
    // Extract base email for OTP verification (remove +X modifier if present)
    const baseEmail = getBaseEmail(email);

    const record = await Otp.findOne({ email: baseEmail, otp });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, msg: "Invalid or expired OTP" });
    }

    // Look up user by FULL email (with +X modifier if provided)
    // This allows different +X variants to be different users
   

    const user = await User.findOne({ email });

    if (user) {
      if (!user.role) {
        return res.status(400).json({
          success: false,
          msg: "User role not found. Please contact admin.",
        });
      }

      const token = jwt.sign(
        { email: user.email, role: user.role, userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, cookieOptions);

      return res.json({
        success: true,
        user_exists: true,
        role: user.role,
      });
    }

    // New user → signup needed
    return res.json({
      success: true,
      user_exists: false,
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

// 3️⃣ SIGNUP
export const signup = async (req, res) => {
  try {
    const { email, role, data } = req.body;

    const user = await User.create({ email, role, data });

    const token = jwt.sign(
      { email: user.email, role: user.role, userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, cookieOptions);

    return res.json({
      success: true,
      role: user.role,
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

// 4️⃣ GET PROFILE
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(401).json({ success: false, msg: "User not found" });
    }

    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        entry_no: user.entry_no,
        department: user.department,
        year: user.year,
        semester: user.semester,
        advisor_department: user.advisor_department,
        advisor_year: user.advisor_year,
        advisor_batch : user.advisor_batch,
        data: user.data,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

// 5️⃣ LOGOUT
export const logout = async (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.json({ success: true, msg: "Logged out successfully" });
};
