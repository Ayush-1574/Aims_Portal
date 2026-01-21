import User from "../../models/Auth/User.js";
import AuditLog from "../../models/AuditLog.js";
import { logAudit } from "../../middleware/admin.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    const usersByRole = {
      student: 0,
      instructor: 0,
      faculty_advisor: 0,
      admin: 0
    };

    stats.forEach(stat => {
      if (stat._id in usersByRole) {
        usersByRole[stat._id] = stat.count;
      }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        usersByRole,
        timestamp: new Date()
      }
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ success: false, msg: "Failed to fetch stats" });
  }
};

// Get all users with filters and pagination
export const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10, status = "all" } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (role) filter.role = role;
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(filter)
      .select("-__v")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, msg: "Failed to fetch users" });
  }
};

// Get single user details
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-__v");

    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ success: false, msg: "Failed to fetch user" });
  }
};

// Change user role
export const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole, reason } = req.body;

    const validRoles = ["student", "instructor", "faculty_advisor", "admin"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ success: false, msg: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const previousRole = user.role;

    // Update user role
    user.role = newRole;
    user.updatedAt = new Date();

    // Add to role history if not already present
    if (!user.roleHistory) {
      user.roleHistory = [];
    }
    user.roleHistory.push({
      role: newRole,
      changedAt: new Date(),
      changedBy: req.user._id
    });

    await user.save();

    // Log the action
    await logAudit(
      req.user._id,
      "change_role",
      userId,
      {
        before: { role: previousRole },
        after: { role: newRole }
      },
      reason,
      req
    );

    res.json({
      success: true,
      msg: "User role updated successfully",
      data: user
    });
  } catch (err) {
    console.error("Error changing user role:", err);
    res.status(500).json({ success: false, msg: "Failed to change user role" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    // Prevent deleting admin
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    if (user.role === "admin" && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, msg: "Cannot delete admin users" });
    }

    // Log the action (soft delete is better - just deactivate)
    await logAudit(
      req.user._id,
      "delete_user",
      userId,
      {
        before: { email: user.email, role: user.role },
        after: null
      },
      reason,
      req
    );

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      msg: "User deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ success: false, msg: "Failed to delete user" });
  }
};

// Deactivate/Reactivate user
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    user.isActive = isActive;
    await user.save();

    await logAudit(
      req.user._id,
      isActive ? "activate_user" : "deactivate_user",
      userId,
      {
        before: { isActive: !isActive },
        after: { isActive }
      },
      null,
      req
    );

    res.json({
      success: true,
      msg: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: user
    });
  } catch (err) {
    console.error("Error toggling user status:", err);
    res.status(500).json({ success: false, msg: "Failed to update user status" });
  }
};

// Bulk role conversion
export const bulkRoleConversion = async (req, res) => {
  try {
    const { userIds, newRole, reason } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, msg: "No users selected" });
    }

    const validRoles = ["student", "instructor", "faculty_advisor"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ success: false, msg: "Invalid role" });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { 
        role: newRole,
        updatedAt: new Date()
      }
    );

    // Log the bulk action
    await logAudit(
      req.user._id,
      "bulk_role_change",
      null,
      {
        before: { count: userIds.length },
        after: { count: userIds.length, role: newRole }
      },
      reason,
      req
    );

    res.json({
      success: true,
      msg: `${result.modifiedCount} users updated successfully`,
      data: result
    });
  } catch (err) {
    console.error("Error in bulk role conversion:", err);
    res.status(500).json({ success: false, msg: "Failed to update users" });
  }
};

// Get audit logs
export const getAuditLogs = async (req, res) => {
  try {
    const { action, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter)
      .populate("adminId", "name email")
      .populate("targetUserId", "name email role")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    res.status(500).json({ success: false, msg: "Failed to fetch audit logs" });
  }
};
// Create new user (Student/Instructor)
export const createUser = async (req, res) => {
  try {
    const { name, email, role, data } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ success: false, msg: "Name, email, and role are required" });
    }

    // Validate role
    const validRoles = ["student", "instructor"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, msg: "Role must be student or instructor" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: "User with this email already exists" });
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      role,
      data: data || {},
      isActive: true,
      roleHistory: [{
        role,
        changedAt: new Date(),
        changedBy: req.user._id
      }]
    });

    // Log the action
    await logAudit(
      req.user._id,
      "create_user",
      newUser._id,
      { before: null, after: { name, email, role } },
      "New user created",
      req
    );

    res.json({
      success: true,
      msg: "User created successfully",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ success: false, msg: "Failed to create user" });
  }
};