import api from "./axios";

export const fetchEnrolledStudents = (courseId) =>
  api.get(`/enrollment/course/${courseId}/enrolled`).then(res => res.data);

export const updateStudentRecord = (id, payload) =>
  api.patch(`/enrollment/${id}/update-record`, payload).then(res => res.data);
