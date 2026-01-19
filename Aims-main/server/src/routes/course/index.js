import express from "express";
import auth from "../../middleware/auth.js";
import { allowRoles } from "../../middleware/role.js";
import {
  offerCourse,
  advisorApproveCourse,
  advisorRejectCourse,
  getCoursesWithFilters,
  getInstructorCourses,
  getPendingCourses
} from "../../controllers/course/index.js";

const router = express.Router();

// Instructor offers course
router.post(
  "/offer",
  auth,
  allowRoles("instructor"),
  offerCourse
);


// Advisor approves
router.post(
  "/approve/:id",
  auth,
  allowRoles("faculty_advisor"),
  advisorApproveCourse
);

// Advisor rejects
router.post(
  "/reject/:id",
  auth,
  allowRoles("faculty_advisor"),
  advisorRejectCourse
);

// Student fetch courses with filters (CoursesPage.jsx)
router.get(
  "/",
  auth,
  allowRoles("student", "instructor", "faculty_advisor"),
  getCoursesWithFilters
);

// Instructor views own offerings
router.get(
  "/my",
  auth,
  allowRoles("instructor"),
  getInstructorCourses
);

// Advisor fetches pending courses for approval
router.get(
  "/pending",
  auth,
  allowRoles("faculty_advisor"),
  getPendingCourses
);

export default router;
