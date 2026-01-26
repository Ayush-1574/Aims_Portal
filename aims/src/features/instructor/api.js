import client from "@/core/api/client";

// --- COURSES ---
export const fetchMyCourses = async () => {
  const res = await client.get("/courses/my");
  return res.data.courses; 
};

export const offerCourse = async (courseData) => {
  const res = await client.post("/courses/offer", courseData);
  return res.data;
};

// --- ENROLLMENTS ---
export const fetchEnrollmentRequests = async () => {
  const res = await client.get("/enrollment/instructor");
  return res.data.data;
};

export const approveEnrollment = async (id) => {
  const res = await client.post(`/enrollment/instructor/approve/${id}`);
  return res.data;
};

export const rejectEnrollment = async (id) => {
  const res = await client.post(`/enrollment/instructor/reject/${id}`);
  return res.data;
};

// --- STUDENTS ---
export const fetchEnrolledStudents = async (courseId) => {
  const res = await client.get(`/enrollment/course/${courseId}/enrolled`);
  return res.data.data;
};

export const updateStudentGrade = async (enrollmentId, payload) => {
  // payload: { grade: 'A', attendance: 85 }
  const res = await client.patch(`/enrollment/${enrollmentId}/update-record`, payload);
  return res.data;
};

// Instructor views feedback dashboard
export const getInstructorFeedback = () =>
  client.get("/feedback/instructor");

export const dropStudentFaculty = (enrollmentId) =>
  client.patch(`/enrollment/drop/faculty/${enrollmentId}`);