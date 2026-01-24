import User from "../models/Auth/UserModel.js";
import GlobalData from "../models/GlobalData.js";

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


// Update user details (name, entry_no, department, year, semester, advisor_department, advisor_year)
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, entry_no, department, year, semester, advisor_department, advisor_year } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (entry_no !== undefined) user.entry_no = entry_no;
    if (department !== undefined) user.department = department;
    if (year !== undefined) user.year = year;
    if (semester !== undefined) user.semester = semester;
    if (advisor_department !== undefined) user.advisor_department = advisor_department;
    if (advisor_year !== undefined) user.advisor_year = advisor_year;

    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      msg: "User updated successfully",
      data: user
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ success: false, msg: "Failed to update user" });
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

// Create new user (Student/Instructor/Faculty Advisor)
export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      entry_no,
      department,
      year,
      semester,
      advisor_department,
      advisor_year
    } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ success: false, msg: "Name, email, and role are required" });
    }

    // Validate role
    const validRoles = ["student", "instructor", "faculty_advisor", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, msg: "Invalid role" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: "User with this email already exists" });
    }

    // Validate student fields
    if (role === "student") {
      if (!entry_no || !department || !year || !semester) {
        return res.status(400).json({
          success: false,
          msg: "Entry number, department, year, and semester are required for students"
        });
      }
    }

    // Validate faculty advisor fields
    if (role === "faculty_advisor") {
      if (!advisor_department || !advisor_year) {
        return res.status(400).json({
          success: false,
          msg: "Department and year are required for faculty advisors"
        });
      }
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      role,
      // Student fields
      entry_no: role === "student" ? entry_no : undefined,
      department: role === "student" ? department : undefined,
      year: role === "student" ? parseInt(year) : undefined,
      semester: role === "student" ? parseInt(semester) : undefined,
      // Faculty Advisor fields
      advisor_department: role === "faculty_advisor" ? advisor_department : undefined,
      advisor_year: role === "faculty_advisor" ? parseInt(advisor_year) : undefined,
      isActive: true,
      roleHistory: [{
        role,
        changedAt: new Date(),
        changedBy: req.user._id
      }]
    });

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
    res.status(500).json({ success: false, msg: "Failed to create user: " + err.message });
  }
};

// ===== GLOBAL DATA MANAGEMENT =====

// Get global data by type (departments, sessions, categories, grade scales)
export const getGlobalData = async (req, res) => {
  try {
    const { type } = req.params;

    // Validate type
    const validTypes = ["DEPARTMENT", "SESSION", "CATEGORY", "GRADE_SCALE"];
    if (!validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({ success: false, msg: "Invalid data type" });
    }

    const data = await GlobalData.findOne({ type: type.toUpperCase() });

    if (!data) {
      return res.json({
        success: true,
        data: {
          type: type.toUpperCase(),
          items: []
        }
      });
    }

    res.json({
      success: true,
      data: {
        type: type.toUpperCase(),
        items: data.items || []
      }
    });
  } catch (err) {
    console.error("Error fetching global data:", err);
    res.status(500).json({ success: false, msg: "Failed to fetch global data" });
  }
};

// Create new global data entry (add item to array)
export const createGlobalData = async (req, res) => {
  try {
    const { type, key, value } = req.body;

    // Validate required fields
    if (!type || !key || !value) {
      return res.status(400).json({
        success: false,
        msg: "Type, key, and value are required"
      });
    }

    // Validate type
    const validTypes = ["DEPARTMENT", "SESSION", "CATEGORY", "GRADE_SCALE"];
    if (!validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({ success: false, msg: "Invalid data type" });
    }

    // Find or create the document for this type
    let globalData = await GlobalData.findOne({ type: type.toUpperCase() });

    if (!globalData) {
      // Create new document for this type
      globalData = await GlobalData.create({
        type: type.toUpperCase(),
        items: [{
          key: key.toUpperCase(),
          value,
          isActive: true
        }]
      });
    } else {
      // Check if key already exists
      const existingItem = globalData.items.find(item => item.key.toUpperCase() === key.toUpperCase());
      if (existingItem) {
        return res.status(400).json({
          success: false,
          msg: `${key} already exists for ${type}`
        });
      }

      // Add new item to array
      globalData.items.push({
        key: key.toUpperCase(),
        value,
        isActive: true
      });
      await globalData.save();
    }

    res.json({
      success: true,
      msg: "Global data created successfully",
      data: globalData
    });
  } catch (err) {
    console.error("Error creating global data:", err);
    res.status(500).json({ success: false, msg: "Failed to create global data" });
  }
};

// Update global data entry (update item in array)
export const updateGlobalData = async (req, res) => {
  try {
    const { type, itemId } = req.params;
    const { value, isActive } = req.body;

    // Validate type
    const validTypes = ["DEPARTMENT", "SESSION", "CATEGORY", "GRADE_SCALE"];
    if (!validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({ success: false, msg: "Invalid data type" });
    }

    const globalData = await GlobalData.findOne({ type: type.toUpperCase() });
    if (!globalData) {
      return res.status(404).json({ success: false, msg: "Data type not found" });
    }

    // Find and update the item
    const item = globalData.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, msg: "Item not found" });
    }

    if (value !== undefined) item.value = value;
    if (isActive !== undefined) item.isActive = isActive;

    await globalData.save();

    res.json({
      success: true,
      msg: "Global data updated successfully",
      data: globalData
    });
  } catch (err) {
    console.error("Error updating global data:", err);
    res.status(500).json({ success: false, msg: "Failed to update global data" });
  }
};

// Delete global data entry (remove item from array)
export const deleteGlobalData = async (req, res) => {
  try {
    const { type, itemId } = req.params;

    // Validate type
    const validTypes = ["DEPARTMENT", "SESSION", "CATEGORY", "GRADE_SCALE"];
    if (!validTypes.includes(type.toUpperCase())) {
      return res.status(400).json({ success: false, msg: "Invalid data type" });
    }

    const globalData = await GlobalData.findOne({ type: type.toUpperCase() });
    if (!globalData) {
      return res.status(404).json({ success: false, msg: "Data type not found" });
    }

    // Remove item from array
    const item = globalData.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, msg: "Item not found" });
    }

    item.deleteOne();
    await globalData.save();

    res.json({
      success: true,
      msg: "Global data deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting global data:", err);
    res.status(500).json({ success: false, msg: "Failed to delete global data" });
  }
};