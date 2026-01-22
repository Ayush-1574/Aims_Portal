import Course from "../../models/course/course.js";
import User from "../../models/Auth/User.js";

/**
 * Instructor offers a course
 */
export const offerCourse = async (req, res) => {
  try {
    const { courseCode , title, dept, year, ltp, session } = req.body;
    console.log("Offering course:", courseCode, "for dept:", dept, "year:", year);
    
    const course = await Course.create({
      courseCode,
      title,
      dept,
      year,
      ltp,
      session,
      instructor: req.user.userId, 
      status: "PENDING_APPROVAL"
    });
    
    console.log("Course created:", course._id);
    return res.json({ success: true, course});
    
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

/**
 * Advisor approves course → becomes OPEN for enrollment
 */
export const advisorApproveCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: "OPEN" },
      { new: true }
    );

    return res.json({ success: true, course });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

/**
 * Advisor rejects course
 */
export const advisorRejectCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: "REJECTED" },
      { new: true }
    );

    return res.json({ success: true, course });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

/**
 * Student view + filter courses (Used by CoursesPage.jsx)
 */
export const getCoursesWithFilters = async (req, res) => {
  try {
    const query = {};

    if (req.query.dept) query.dept = req.query.dept;
    if (req.query.code) query.courseCode = new RegExp(req.query.code, "i");
    if (req.query.title) query.title = new RegExp(req.query.title, "i");
    if (req.query.session) query.session = req.query.session;

    // status filter usable by advisor/instructor
    if (req.query.status) {
      query.status = req.query.status.toUpperCase();
    }

    // students default => only show OPEN
    if (!req.query.status && req.user.role === "student") {
      query.status = "OPEN";
    }

    const courses = await Course.find(query)
      .populate("instructor", "email name");

    return res.json({ success: true, courses });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};


/**
 * Instructor fetch own offered courses
 */
export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      instructor: req.user.userId
    }).sort("-createdAt");

    return res.json({ success: true, courses });

  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

export const getPendingCourses = async (req, res) => {
  try {
    // Fetch the full user object to get advisor_department and advisor_year
    const advisor = await User.findById(req.user.userId);

    if (!advisor) {
      return res.status(404).json({ success: false, msg: "Advisor not found" });
    }

    const advisorDept = advisor.advisor_department;
    const advisorYear = advisor.advisor_year;

    console.log("Advisor:", advisor.email);
    console.log("Advisor filtering - Dept:", advisorDept, "Year:", advisorYear);

    // Only show pending courses for this advisor's department and year
    const courses = await Course.find({
      status: "PENDING_APPROVAL",
      dept: advisorDept,
      year: advisorYear
    })
      .populate("instructor", "email");

    console.log("Found", courses.length, "pending courses for this advisor");
    return res.json({ success: true, courses });
  } catch (err) {
    console.error("Error in getPendingCourses:", err);
    return res.status(500).json({ success: false, msg: err.message });
  }
};

