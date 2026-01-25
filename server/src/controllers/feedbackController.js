import Feedback from "../models/FeedbackModel.js";
import Enrollment from "../models/EnrollmentModel.js";
import SystemSettings from "../models/SystemSettingsModel.js";

/* Student submits feedback */
export const submitFeedback = async (req, res) => {
  const { courseId, rating, teachingQuality, workload, comments } = req.body;

  const enrollment = await Enrollment.findOne({
    course: courseId,
    student: req.user.userId,
    status: "ENROLLED"
  }).populate("course");

  if (!enrollment) {
    return res.status(403).json({ msg: "Not enrolled" });
  }

  const sessionSetting = await SystemSettings.findOne({
    key: "feedback_session"
  });

  if (!sessionSetting || enrollment.course.session !== sessionSetting.value) {
    return res.status(403).json({ msg: "Feedback not allowed for this session" });
  }

  const exists = await Feedback.findOne({
    course: courseId,
    session: enrollment.course.session
  });

  if (exists) {
    return res.status(400).json({ msg: "Feedback already submitted" });
  }

  await Feedback.create({
    course: courseId,
    instructor: enrollment.course.instructor,
    session: enrollment.course.session,
    rating,
    teachingQuality,
    workload,
    comments
  });

  res.json({ success: true });
};

/* Instructor views feedback */
export const getInstructorFeedback = async (req, res) => {
  const sessionSetting = await SystemSettings.findOne({
    key: "feedback_session"
  });

  const data = await Feedback.find({
    instructor: req.user.userId,
    session: sessionSetting?.value
  }).populate("course", "courseCode title session");

  res.json({ success: true, data });
};