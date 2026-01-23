import Enrollment from "../models/EnrollmentModel.js";
import Course from "../models/CourseModel.js";
import User from "../models/Auth/UserModel.js";

// STUDENT: request enrollment
export const requestEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Get student details to find matching faculty advisor
    const student = await User.findById(req.user.userId);
    if (!student) {
      return res.status(404).json({ success: false, msg: "Student not found" });
    }

    const existing = await Enrollment.findOne({
      course: courseId,
      student: req.user.userId
    });

    if (existing) {
      return res.status(400).json({ success: false, msg: "Already requested" });
    }

    // Find faculty advisor with matching department and year
    const advisor = await User.findOne({
      role: "faculty_advisor",
      advisor_department: student.department,
      advisor_year: student.year
    });

    const record = await Enrollment.create({
      course: courseId,
      student: req.user.userId,
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
      .populate("student", "name email")
      .populate("course", "courseCode title session");

    return res.json({ success: true, data });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};


// ADVISOR: view requests
export const getAdvisorEnrollRequests = async (req, res) => {
  try {
    const data = await Enrollment.find({ status: "PENDING_ADVISOR" })
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

    const formatted = data.map(e => ({
      id: e._id,
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
      .populate("student", "name email")
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
