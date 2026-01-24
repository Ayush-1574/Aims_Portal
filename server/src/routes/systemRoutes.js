import express from "express";
import  protect  from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import {
  setFeedbackStatus,
  getFeedbackStatus,
  setFeedbackSession,
  getFeedbackSession
} from "../controllers/systemController.js";

const router = express.Router();

router.post("/feedback-toggle", protect, allowRoles("admin"), setFeedbackStatus);
router.get("/feedback-status", protect, getFeedbackStatus);

router.post("/feedback-session", protect, allowRoles("admin"), setFeedbackSession);
router.get("/feedback-session", protect, getFeedbackSession);

export default router;