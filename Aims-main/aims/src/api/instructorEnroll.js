import api from "./axios";

export const fetchInstructorEnrollRequests = () =>
  api.get("/enrollment/instructor").then(res => res.data);

export const approveEnroll = (id) =>
  api.post(`/enrollment/instructor/approve/${id}`).then(res => res.data);

export const rejectEnroll = (id) =>
  api.post(`/enrollment/instructor/reject/${id}`).then(res => res.data);
