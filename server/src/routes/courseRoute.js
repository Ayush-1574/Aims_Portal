import express from "express";
import auth from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import {
  offerCourse,
  advisorApproveCourse,
  advisorRejectCourse,
  getCoursesWithFilters,
  getInstructorCourses,
  getPendingCourses
} from "../controllers/courseController.js";

const router = express.Router();

// Instructor offers course
router.post(
  "/offer",
  auth,
  allowRoles("instructor"),
  offerCourse
);


// Admin approves
router.post(
  "/approve/:id",
  auth,
  allowRoles("admin"),
  advisorApproveCourse
);

// Admin rejects
router.post(
  "/reject/:id",
  auth,
  allowRoles("admin"),
  advisorRejectCourse
);

// Student/Instructor/Admin fetch courses with filters
router.get(
  "/",
  auth,
  allowRoles("student", "instructor", "faculty_advisor", "admin"),
  getCoursesWithFilters
);

// Instructor views own offerings
router.get(
  "/my",
  auth,
  allowRoles("instructor"),
  getInstructorCourses
);

// Admin fetches pending courses for approval
router.get(
  "/pending",
  auth,
  allowRoles("admin"),
  getPendingCourses
);

export default router;
