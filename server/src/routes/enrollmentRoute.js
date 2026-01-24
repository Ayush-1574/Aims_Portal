import express from "express";
import auth from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import {
  requestEnrollment,
  instructorApproveEnrollment,
  advisorApproveEnrollment,
  instructorRejectEnrollment,
  advisorRejectEnrollment,
  getStudentEnrollments,
  getInstructorEnrollRequests,
  getAdvisorEnrollRequests,
  getEnrolledStudents,
    updateEnrollmentRecord

} from "../controllers/enrollmentController.js";

const router = express.Router();

// Student requests enrollment
router.post(
  "/request",
  auth,
  allowRoles("student"),
  requestEnrollment
);

// Instructor approves
router.post(
  "/instructor/approve/:id",
  auth,
  allowRoles("instructor"),
  instructorApproveEnrollment
);

// Instructor rejects
router.post(
  "/instructor/reject/:id",
  auth,
  allowRoles("instructor"),
  instructorRejectEnrollment
);

// Advisor approves
router.post(
  "/faculty_advisor/approve/:id",
  auth,
  allowRoles("faculty_advisor"),
  advisorApproveEnrollment
);

// Advisor rejects
router.post(
  "/faculty_advisor/reject/:id",
  auth,
  allowRoles("faculty_advisor"),
  advisorRejectEnrollment
);

// Student views their enrollments (for record + status)
router.get(
  "/my",
  auth,
  allowRoles("student"),
  getStudentEnrollments
);

// Instructor views requests to their courses
router.get(
  "/instructor",
  auth,
  allowRoles("instructor"),
  getInstructorEnrollRequests
);

// Advisor views pending requests
router.get(
  "/faculty_advisor",
  auth,
  allowRoles("faculty_advisor"),
  getAdvisorEnrollRequests
);


router.get(
  "/course/:courseId/enrolled",
  auth,
  allowRoles("instructor"),
  getEnrolledStudents
);

// Instructor updates grade/attendance for a student enrollment record
router.patch(
  "/:id/update-record",
  auth,
  allowRoles("instructor"),
  updateEnrollmentRecord
);

export default router;
