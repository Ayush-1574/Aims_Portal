import client from "@/core/api/client";

// --- COURSE APPROVALS ---

// Fetch courses waiting for Advisor approval
export const fetchPendingCourses = async () => {
  const res = await client.get("/courses/pending");
  // Backend returns { success: true, courses: [...] }
  return res.data.courses;
};

export const approveCourse = async (courseId) => {
  const res = await client.post(`/courses/approve/${courseId}`);
  return res.data;
};

export const rejectCourse = async (courseId) => {
  const res = await client.post(`/courses/reject/${courseId}`);
  return res.data;
};

// --- ENROLLMENT REQUESTS ---

// Fetch student enrollment requests pending Advisor approval
export const fetchEnrollmentRequests = async () => {
  const res = await client.get("/enrollment/faculty_advisor");
  // Backend returns { success: true, data: [...] }
  return res.data.data;
};
 
export const approveEnrollment = async (enrollmentId) => {
  const res = await client.post(`/enrollment/faculty_advisor/approve/${enrollmentId}`);
  return res.data;
};

export const rejectEnrollment = async (enrollmentId) => {
  const res = await client.post(`/enrollment/faculty_advisor/reject/${enrollmentId}`);
  return res.data;
};

// --- GENERAL STATUS ---

// Fetch all courses to view their overall status
export const fetchAllCourses = async () => {
  const res = await client.get("/courses");
  // Backend returns { success: true, courses: [...] }
  return res.data.courses;
};