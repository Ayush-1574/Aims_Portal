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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
    });

    await sendEmail({
      to: email,
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

    // const record = await Otp.findOne({ email, otp });

    // if (!record || record.expiresAt < new Date()) {
    //   return res.status(400).json({ success: false, msg: "Invalid or expired OTP" });
    // }

    const user = await User.findOne({ email });
    console.log(user);


    if (user) {
      // existing user → login
      const token = jwt.sign(
        { email, role: user.role, userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

     res.cookie("token", token, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  domain: "localhost",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});


      return res.json({
        success: true,
        user_exists: true,
        role: user.role,
      });
    }

    // new user → signup needed
    const role_hint = resolveRoleHint(email);

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

    const user = await User.create({ email, role, data });

    const token = jwt.sign(
      { email, role, userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  domain: "localhost",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});


    return res.json({ success: true, role });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

// 4. GET PROFILE
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(401).json({ success: false });

    // sanitize response
    return res.json({
      success : true,
      user : {
      email: user.email,
      role: user.role,
      data: user.data,}
    });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

// 5. LOGOUT (optional)
export const logout = async (req, res) => {
  res.clearCookie("token");
  return res.json({ success: true });
};
