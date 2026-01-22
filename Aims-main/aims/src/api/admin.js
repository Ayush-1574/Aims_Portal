import api from "./axios";

const API_BASE = "/admin";

// Dashboard
export const fetchDashboardStats = async () => {
  try {
    const res = await api.get(`${API_BASE}/dashboard/stats`);
    return res.data.data;
  } catch (err) {
    console.error("Error fetching stats:", err);
    throw err;
  }
};

// Users
export const fetchAllUsers = async (filters = {}, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    const res = await api.get(`${API_BASE}/users?${params}`);
    return res.data.data;
  } catch (err) {
    console.error("Error fetching users:", err);
    throw err;
  }
};

export const fetchUserDetails = async (userId) => {
  try {
    const res = await api.get(`${API_BASE}/users/${userId}`);
    return res.data.data;
  } catch (err) {
    console.error("Error fetching user:", err);
    throw err;
  }
};

// Create new user (Student/Instructor/Faculty Advisor)
export const createNewUser = async (formData) => {
  try {
    const res = await api.post(
      `${API_BASE}/users`,
      formData
    );
    return res.data.data;
  } catch (err) {
    console.error("Error creating user:", err);
    throw err;
  }
};

// Role Management
export const changeUserRole = async (userId, newRole, reason) => {
  try {
    const res = await api.put(
      `${API_BASE}/users/${userId}/role`,
      { newRole, reason }
    );
    return res.data.data;
  } catch (err) {
    console.error("Error changing role:", err);
    throw err;
  }
};

// Update user details (name, entry_no, department, year, semester, advisor_department, advisor_year)
export const updateUser = async (userId, userData) => {
  try {
    const res = await api.put(
      `${API_BASE}/users/${userId}`,
      userData
    );
    return res.data.data;
  } catch (err) {
    console.error("Error updating user:", err);
    throw err;
  }
};

export const deleteUser = async (userId, reason) => {
  try {
    const res = await api.delete(
      `${API_BASE}/users/${userId}`,
      {
        data: { reason }
      }
    );
    return res.data.data;
  } catch (err) {
    console.error("Error deleting user:", err);
    throw err;
  }
};

// Bulk Operations
export const bulkRoleConversion = async (userIds, newRole, reason) => {
  try {
    const res = await api.post(
      `${API_BASE}/users/bulk/role-conversion`,
      { userIds, newRole, reason }
    );
    return res.data.data;
  } catch (err) {
    console.error("Error in bulk conversion:", err);
    throw err;
  }
};
