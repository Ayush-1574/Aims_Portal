import client from "@/core/api/client"; // Ensure this points to your configured axios instance

// 1. Fetch available courses (Matches GET /courses)
export const fetchOfferedCourses = async (filters = {}) => {
  const res = await client.get("/courses", { params: filters });
  // Backend returns { success: true, courses: [...] }
  return res.data.courses;
};

// 2. Request enrollment (Matches POST /enrollment/request)
export const enrollInCourse = async (courseId) => {
  const res = await client.post("/enrollment/request", { courseId });
  return res.data;
};

// 3. Fetch student's own record (Matches GET /enrollment/my)
export const fetchStudentRecord = async () => {
  const res = await client.get("/enrollment/my");
  // Backend returns { success: true, data: [...] }
  return res.data; 
};
// Check if feedback is open
export const getFeedbackStatus = () =>
  client.get("/system/feedback-status").then(r => r.data);

// Get active feedback session
export const getFeedbackSession = () =>
  client.get("/system/feedback-session").then(r => r.data);

// Submit feedback (anonymous)
export const submitFeedback = (data) =>
  client.post("/feedback", data);