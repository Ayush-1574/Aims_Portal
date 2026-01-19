import api from "./axios";

export const fetchPendingCourses = () =>
  api.get("/courses", { params: { status: "PENDING_APPROVAL" } })
     .then(res => res.data);

export const fetchCourses = () =>
  api.get("/courses").then(res => res.data);

export const advisorApproveCourse = (id) =>
  api.post(`/courses/approve/${id}`).then(res => res.data);

export const advisorRejectCourse = (id) =>
  api.post(`/courses/reject/${id}`).then(res => res.data);
