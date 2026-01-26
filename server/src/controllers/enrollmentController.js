import Enrollment from "../models/EnrollmentModel.js";
import Course from "../models/CourseModel.js";
import User from "../models/Auth/UserModel.js";

// STUDENT: request enrollment
// STUDENT: request enrollment
export const requestEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body;
   
    // Get student details to find matching faculty advisor
    const student = await User.findById(req.user.userId);
    console.log(student)
    if (!student) {
      return res.status(404).json({ success: false, msg: "Student not found" });
    } 

    const existing = await Enrollment.findOne({
  course: courseId,
  student: req.user.userId
});

if (existing) {
  // ❌ Dropped by faculty → permanently blocked
  if (existing.status === "DROPPED_FACULTY") {
    return res.status(403).json({
      success: false,
      msg: "You were dropped by faculty. Re-enrollment not allowed."
    });
  }

  // ✅ Dropped by student → allow re-enroll
  if (existing.status === "DROPPED_STUDENT") {
    await Enrollment.findByIdAndDelete(existing._id);
  } else {
    return res.status(400).json({
      success: false,
      msg: "Already requested or enrolled"
    });
  }

}


    // Fetch course to get session
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, msg: "Course not found" });
    }
    const batch = student.entry_no.substring(0, 4);
    // Find faculty advisor with matching department and year
    const advisor = await User.findOne({
      role: "faculty_advisor",
      advisor_department: student.department,
      advisor_batch : batch
    });

    const record = await Enrollment.create({
      course: courseId,
      student: req.user.userId,
      session: course.session,
      faculty_advisor: advisor?._id || null,
      status: "PENDING_INSTRUCTOR"
    });

    return res.json({ success: true, record });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

// INSTRUCTOR: approve
export const instructorApproveEnrollment = async (req, res) => {
  try {
    const updated = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status: "PENDING_ADVISOR" },
      { new: true }
    );

    return res.json({ success: true, updated });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};


// INSTRUCTOR: reject
export const instructorRejectEnrollment = async (req, res) => {
  try {
    const updated = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status: "REJECTED" },
      { new: true }
    );

    return res.json({ success: true, updated });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};


// ADVISOR: approve
export const advisorApproveEnrollment = async (req, res) => {
  try {
    const updated = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status: "ENROLLED" },
      { new: true }
    );

    return res.json({ success: true, updated });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};



// ADVISOR: reject
export const advisorRejectEnrollment = async (req, res) => {
  try {
    const updated = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status: "REJECTED" },
      { new: true }
    );

    return res.json({ success: true, updated });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};







// INSTRUCTOR: view requests
export const getInstructorEnrollRequests = async (req, res) => {
  try {
    const courseList = await Course.find({ instructor: req.user.userId });
    const courseIds = courseList.map(c => c._id);

    const data = await Enrollment.find({
      course: { $in: courseIds },
      status: "PENDING_INSTRUCTOR"
    })
      .populate("student", "name email year department")
      .populate("course", "courseCode title session");

    return res.json({ success: true, data });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};


// ADVISOR: view requests
export const getAdvisorEnrollRequests = async (req, res) => {
  try {
    const advisorId = req.user.userId;

    const data = await Enrollment.find({
      status: "PENDING_ADVISOR",
      faculty_advisor: advisorId
    })
      .populate("course", "courseCode title session")
      .populate("student", "name email");

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};


export const getStudentEnrollments = async (req, res) => {
  try {
    const data = await Enrollment.find({ student: req.user.userId })
      .populate("course");

    const formatted = data
  .filter(e => e.course) // <-- VERY IMPORTANT
  .map(e => ({
    id: e._id,
    course: e.course._id,
    code: e.course.courseCode,
    title: e.course.title,
    ltp: e.course.ltp,
    semester: e.semester,
    session: e.course.session,
    status: e.status,
    category: e.category,
    grade: e.grade,
    attendance: e.attendance,
    enrolled: e.status === "ENROLLED"
  }));

    return res.json({ success: true, data: formatted });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};


// INSTRUCTOR: fetch enrolled students for editing
export const getEnrolledStudents = async (req, res) => {
  try {
    const data = await Enrollment.find({
      course: req.params.courseId,
      status: "ENROLLED"
    })
      .populate("student", "name email department")
      .populate("course", "courseCode title");

    return res.json({ success: true, data });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};


// INSTRUCTOR: update grade + attendance
export const updateEnrollmentRecord = async (req, res) => {
  try {
    const { grade, attendance } = req.body;

    const updated = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { grade, attendance },
      { new: true }
    );

    return res.json({ success: true, updated });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

import SystemSettings from "../models/SystemSettingsModel.js";

export const getMyCurrentSessionEnrollments = async (req, res) => {
  try {
    // Get current session set by admin
    const sessionSetting = await SystemSettings.findOne({
      key: "feedback_session"
    });

    if (!sessionSetting) {
      
      return res.json({ success: true, data: [] });
    }

    const currentSession = sessionSetting.value;
   // console.log("Current session:", currentSession);


    const data = await Enrollment.find({
      student: req.user.userId,
      status: "ENROLLED"
    }).populate({
      path: "course",
      match: { session: currentSession }
    });

    
    // Remove non-matching populated docs
    const filtered = data
      .filter(e => e.course)
      .map(e => ({
        id: e._id,
        courseId: e.course._id,
        code: e.course.courseCode,
        title: e.course.title,
        session: e.course.session
      }));

    res.json({ success: true, data: filtered , msg : "hello" });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
export const studentDropCourse = async (req, res) => {
  const enrollment = await Enrollment.findOne({
    _id: req.params.id,
    student: req.user.userId,
    status: "ENROLLED"
  });

  if (!enrollment) {
    return res.status(400).json({ msg: "Enrollment not found" });
  }

  enrollment.status = "DROPPED_STUDENT";
  enrollment.droppedBy = "student";
  await enrollment.save();

  res.json({ success: true });
};

export const facultyDropStudent = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        msg: "Enrollment not found"
      });
    }

    // Optional safety: ensure only ENROLLED students can be dropped
    if (enrollment.status !== "ENROLLED") {
      return res.status(400).json({
        success: false,
        msg: "Student is not currently enrolled"
      });
    }

    enrollment.status = "DROPPED_FACULTY";
    enrollment.droppedBy = "faculty";
    await enrollment.save();

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message
    });
  }
};