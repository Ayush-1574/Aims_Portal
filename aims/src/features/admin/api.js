import client from "@/core/api/client";

const API_BASE = "/admin";

// --- DASHBOARD ---
export const fetchDashboardStats = async () => {
  const res = await client.get(`${API_BASE}/dashboard/stats`);
  return res.data.data;
};

// --- USER MANAGEMENT ---
export const fetchAllUsers = async (filters = {}, page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters
  });
  const res = await client.get(`${API_BASE}/users?${params}`);
  return res.data.data;
};

export const fetchUserDetails = async (userId) => {
  const res = await client.get(`${API_BASE}/users/${userId}`);
  return res.data.data;
};

export const createNewUser = async (formData) => {
  const res = await client.post(`${API_BASE}/users`, formData);
  return res.data;
};

export const updateUser = async (userId, userData) => {
  const res = await client.put(`${API_BASE}/users/${userId}`, userData);
  return res.data;
};

export const deleteUser = async (userId, reason) => {
  // Pass reason in body if backend requires it
  const res = await client.delete(`${API_BASE}/users/${userId}`, {
    data: { reason }
  });
  return res.data;
};

export const bulkRoleConversion = async (userIds, newRole, reason) => {
  const res = await client.post(`${API_BASE}/users/bulk/role-conversion`, {
    userIds,
    newRole,
    reason
  });
  return res.data;
};

// --- AUDIT LOGS ---
// (Note: Ensure your backend has this endpoint, otherwise this will 404)
export const fetchAuditLogs = async (action, page = 1, limit = 15) => {
  const params = new URLSearchParams({ action, page, limit });
  const res = await client.get(`${API_BASE}/audit-logs?${params}`);
  return res.data;
};

// --- PENDING COURSE APPROVALS ---
export const fetchPendingCourses = async (page = 1) => {
  const res = await client.get("/courses/pending");
  return res.data;
};

export const approveCourse = async (courseId) => {
  const res = await client.post(`/courses/approve/${courseId}`);
  return res.data;
};

export const rejectCourse = async (courseId) => {
  const res = await client.post(`/courses/reject/${courseId}`);
  return res.data;
};

// --- GLOBAL DATA MANAGEMENT ---
// Public read endpoint
export const fetchGlobalData = async (type) => {
  const res = await client.get(`/global-data/${type}`);
  return res.data.data;
};

// Admin-only write endpoints
export const createGlobalDataEntry = async (type, key, value) => {
  const res = await client.post(`${API_BASE}/global-data`, {
    type,
    key,
    value
  });
  return res.data;
};

export const updateGlobalDataEntry = async (type, itemId, value, isActive) => {
  const res = await client.put(`${API_BASE}/global-data/${type}/${itemId}`, {
    value,
    isActive
  });
  return res.data;
};

export const deleteGlobalDataEntry = async (type, itemId) => {
  const res = await client.delete(`${API_BASE}/global-data/${type}/${itemId}`);
  return res.data;
};
export const setFeedbackStatus = (value) =>
  client.post("/system/feedback-toggle", { value });

export const setFeedbackSession = (session) =>
  client.post("/system/feedback-session", { session });

export const getFeedbackStatus = () =>
  client.get("/system/feedback-status").then(r => r.data);

export const getFeedbackSession = () =>
  client.get("/system/feedback-session").then(r => r.data);
