import api from "./axios";

export const fetchCourses = (params) =>
  api.get("/courses", { params }).then(res => res.data);

export const requestEnrollment = (courseId) =>
  api.post("/enrollment/request", { courseId }).then(res => res.data);
