import Course from "../../models/course/course.js";

/**
 * Instructor offers a course
 */
export const offerCourse = async (req, res) => {
  try {
    const { courseCode , title, dept, ltp, session } = req.body;
    console.log(courseCode)
    
    const course = await Course.create({
      courseCode,
      title,
      dept,
      ltp,
      session,
      instructor: req.user.userId, 
      status: "PENDING_APPROVAL"
    });
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
    const courses = await Course.find({ status: "PENDING_APPROVAL" })
      .populate("instructor", "email");

    return res.json({ success: true, courses });
  } catch (err) {
    return res.status(500).json({ success: false, msg: err.message });
  }
};

