import Feedback from "../models/FeedbackModel.js";
import Enrollment from "../models/EnrollmentModel.js";
import SystemSettings from "../models/SystemSettingsModel.js";

/* ================= STUDENT SUBMITS FEEDBACK ================= */
export const submitFeedback = async (req, res) => {
  try {
    const { courseId, rating, teachingQuality, workload, comments } = req.body;

    /* 1️⃣ Check enrollment */
    const enrollment = await Enrollment.findOne({
      course: courseId,
      student: req.user.userId,
      status: "ENROLLED"
    }).populate("course");

    if (!enrollment) {
      return res.status(403).json({ msg: "Not enrolled" });
    }

    /* 2️⃣ Check active feedback session */
    const sessionSetting = await SystemSettings.findOne({
      key: "feedback_session"
    });

    if (
      !sessionSetting ||
      enrollment.course.session !== sessionSetting.value
    ) {
      return res
        .status(403)
        .json({ msg: "Feedback not allowed for this session" });
    }

    /* 3️⃣ IMPORTANT FIX: check per student */
    const exists = await Feedback.findOne({
      course: courseId,
      student: req.user.userId,
      session: enrollment.course.session
    });

    if (exists) {
      return res
        .status(400)
        .json({ msg: "Feedback already submitted" });
    }

    /* 4️⃣ Create feedback */
    await Feedback.create({
      course: courseId,
      student: req.user.userId,          // ✅ REQUIRED
      instructor: enrollment.course.instructor,
      session: enrollment.course.session,
      rating,
      teachingQuality,
      workload,
      comments
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

/* ================= INSTRUCTOR VIEWS FEEDBACK ================= */
export const getInstructorFeedback = async (req, res) => {
  const sessionSetting = await SystemSettings.findOne({
    key: "feedback_session"
  });

  if (!sessionSetting) {
    return res.json({ success: true, data: [] });
  }

  const data = await Feedback.find({
    instructor: req.user.userId,
    session: sessionSetting.value
  }).populate("course", "courseCode title session");

  res.json({ success: true, data });
};