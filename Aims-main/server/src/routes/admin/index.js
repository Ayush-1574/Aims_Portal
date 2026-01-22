import express from "express";
import { allowRoles } from "../../middleware/role.js";
import { checkAdmin } from "../../middleware/admin.js";
import authMiddleware from "../../middleware/auth.js";
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  changeUserRole,
  updateUser,
  deleteUser,
  bulkRoleConversion,
  createUser
} from "../../controllers/admin/index.js";

const router = express.Router();

// Protect all admin routes
router.use(authMiddleware);
router.use(checkAdmin);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

// User Management
router.post("/users", createUser);
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserDetails);
router.put("/users/:userId", updateUser);
router.put("/users/:userId/role", changeUserRole);
router.delete("/users/:userId", deleteUser);

// Bulk Operations
router.post("/users/bulk/role-conversion", bulkRoleConversion);

export default router;
