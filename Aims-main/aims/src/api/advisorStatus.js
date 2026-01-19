import api from "./axios";

export const fetchAdvisorStatus = () =>
  api.get("/enrollment/faculty_advisor").then(res => res.data);

export const fetchCourses = () =>
  api.get("/courses").then(res => res.data);
