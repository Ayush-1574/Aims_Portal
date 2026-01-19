import api from "./axios";

export const fetchMyCourses = () =>
  api.get("/courses/my").then(res => res.data);

export const fetchInstructorPendingEnrollments = () =>
  api.get("/enrollment/instructor").then(res => res.data);

export const fetchEnrolledCount = (courseId) =>
  api.get(`/enrollment/course/${courseId}/enrolled`)
     .then(res => res.data);
