import express from "express";
import { sendOtp, verifyOtp, signup, getMe, logout } from "../../controllers/auth/index.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/signup", signup);
router.post("/logout", logout);
router.get("/me", auth, getMe);

export default router;
