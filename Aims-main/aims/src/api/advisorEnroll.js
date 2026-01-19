import api from "./axios";

export const fetchAdvisorEnrollRequests = () =>
  api.get("/enrollment/faculty_advisor").then(res => res.data);

export const advisorApprove = (id) =>
  api.post(`/enrollment/faculty_advisor/approve/${id}`).then(res => res.data);

export const advisorReject = (id) =>
  api.post(`/enrollment/faculty_advisor/reject/${id}`).then(res => res.data);
