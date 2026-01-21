import axios from "axios";

const API_BASE = "http://localhost:5000/admin";

// Dashboard
export const fetchDashboardStats = async () => {
  try {
    const res = await axios.get(`${API_BASE}/dashboard/stats`, { withCredentials: true });
    return res.data;
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
    const res = await axios.get(`${API_BASE}/users?${params}`, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error("Error fetching users:", err);
    throw err;
  }
};

export const fetchUserDetails = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/users/${userId}`, { withCredentials: true });
    return res.data;
  } catch (err) {
    console.error("Error fetching user:", err);
    throw err;
  }
};

// Create new user (Student/Instructor/Faculty Advisor)
export const createNewUser = async (formData) => {
  try {
    const res = await axios.post(
      `${API_BASE}/users`,
      formData,
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Error creating user:", err);
    throw err;
  }
};

// Role Management
export const changeUserRole = async (userId, newRole, reason) => {
  try {
    const res = await axios.put(
      `${API_BASE}/users/${userId}/role`,
      { newRole, reason },
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Error changing role:", err);
    throw err;
  }
};

export const toggleUserStatus = async (userId, isActive) => {
  try {
    const res = await axios.put(
      `${API_BASE}/users/${userId}/status`,
      { isActive },
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Error toggling status:", err);
    throw err;
  }
};

export const deleteUser = async (userId, reason) => {
  try {
    const res = await axios.delete(
      `${API_BASE}/users/${userId}`,
      {
        data: { reason },
        withCredentials: true
      }
    );
    return res.data;
  } catch (err) {
    console.error("Error deleting user:", err);
    throw err;
  }
};

// Bulk Operations
export const bulkRoleConversion = async (userIds, newRole, reason) => {
  try {
    const res = await axios.post(
      `${API_BASE}/users/bulk/role-conversion`,
      { userIds, newRole, reason },
      { withCredentials: true }
    );
    return res.data;
  } catch (err) {
    console.error("Error in bulk conversion:", err);
    throw err;
  }
};
