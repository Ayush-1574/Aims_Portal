import api from "./axios";

// student fetches academic record (backend feeds formatted result)
export const getStudentRecord = () =>
  api.get("/enrollment/my").then(res => res.data);
