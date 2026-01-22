import User from "../../models/Auth/User.js";
import Otp from "../../models/Auth/Otp.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/email.js";

// helper for role detection
const resolveRoleHint = (email) => {
  if (email.includes("sonika")) return "instructor";
  if (email.includes("sonika11")) return "advisor";
  return "student";
};

// Helper to extract base email (before + modifier)
const getBaseEmail = (email) => {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const localPart = parts[0].split("+")[0];
  return `${localPart}@${parts[1]}`;
};

// 1. SEND OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);

    if (!email) return res.status(400).json({ success: false, msg: "Email required" });

    // OPTIONAL: IIT domain validation
    if (!email.endsWith("@gmail.com") && !email.endsWith("@iitrpr.ac.in") && !email.endsWith("@aims.com")) {
      return res.status(400).json({ success: false, msg: "Only IIT Ropar emails allowed" });
    }

    // Extract base email (remove +X modifier if present)
    const baseEmail = getBaseEmail(email);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete old OTPs for this base email
    await Otp.deleteMany({ email: baseEmail });

    // Store OTP with base email
    await Otp.create({
      email: baseEmail,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
    });

    // Send email to base email
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
      `
    });

    return res.json({ success: true, otp_sent: true });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, msg: err.message });
  }
};

// 2. VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Extract base email for OTP verification (remove +X modifier if present)
    const baseEmail = getBaseEmail(email);

    // const record = await Otp.findOne({ email: baseEmail, otp });

    // if (!record || record.expiresAt < new Date()) {
    //   return res.status(400).json({ success: false, msg: "Invalid or expired OTP" });
    // }

    // Look up user by FULL email (with +X modifier if provided)
    // This allows different +X variants to be different users
    let user = await User.findOne({ email: email });

    console.log("User lookup result:", user);
    if (user) {
      console.log("User found - Email:", user.email, "Role:", user.role, "ID:", user._id);
    }

    if (user) {
      // existing user → login
      if (!user.role) {
        console.error("ERROR: User found but role is missing/null");
        return res.status(400).json({ success: false, msg: "User role not found. Please contact admin." });
      }
      
      const token = jwt.sign(
        { email: email, role: user.role, userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      console.log("[Auth Controller] OTP verified - returning token for sessionStorage");

      return res.json({
        success: true,
        user_exists: true,
        role: user.role,
        token,  // Return token for sessionStorage (per-tab isolation)
      });
    }

    // new user → signup needed
    const role_hint = resolveRoleHint(baseEmail);

    return res.json({
      success: true,
      user_exists: false,
      role_hint,
    });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

// 3. SIGNUP
export const signup = async (req, res) => {
  try {
    const { email, role, data } = req.body;

    // Store FULL email (with +X modifier if provided)
    // This allows different +X variants to be different users
    const user = await User.create({ email: email, role, data });

    const token = jwt.sign(
      { email: email, role, userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("[Auth Controller] User signup - creating token");

    console.log("[Auth Controller] Returning token for sessionStorage");

    return res.json({ success: true, role, token });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

// 4. GET PROFILE
export const getMe = async (req, res) => {
  try {
    console.log("[GetMe] Fetching profile for userId:", req.user.userId);
    const user = await User.findById(req.user.userId);

    if (!user) {
      console.log("[GetMe] ❌ User not found in database");
      return res.status(401).json({ success: false, msg: "User not found" });
    }

    console.log("[GetMe] ✓ User found:", user.email, "Role:", user.role);

    // Create a fresh token for sessionStorage (per-tab)
    const token = jwt.sign(
      { email: user.email, role: user.role, userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // sanitize response
    return res.json({
      success : true,
      token,  // Send token for sessionStorage storage
      user : {
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
        data: user.data,
      }
    });

  } catch (err) {
    console.error("[GetMe] Error:", err);
    return res.status(500).json({ success: false, msg: err.message });
  }
};

// 5. LOGOUT
export const logout = async (req, res) => {
  // Logout is handled client-side by clearing sessionStorage
  // We can optionally clear cookies if they exist, but they won't be used anyway
  res.clearCookie("token", { path: "/" });
  return res.json({ success: true, msg: "Logged out successfully" });
};
