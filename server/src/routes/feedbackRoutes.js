import express from "express";
import  protect  from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import {
  submitFeedback,
  getInstructorFeedback
} from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/", protect, allowRoles("student"), submitFeedback);
router.get("/instructor", protect, allowRoles("instructor"), getInstructorFeedback);

export default router;