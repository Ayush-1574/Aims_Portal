import express from "express";
import { allowRoles } from "../middleware/role.js";
import { checkAdmin } from "../middleware/admin.js";
import authMiddleware from "../middleware/auth.js";
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  bulkRoleConversion,
  createUser,
  getGlobalData,
  createGlobalData,
  updateGlobalData,
  deleteGlobalData
} from "../controllers/adminController.js";

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
router.delete("/users/:userId", deleteUser);

// Bulk Operations
router.post("/users/bulk/role-conversion", bulkRoleConversion);

// Global Data Management
router.get("/global-data/:type", getGlobalData);
router.post("/global-data", createGlobalData);
router.put("/global-data/:type/:itemId", updateGlobalData);
router.delete("/global-data/:type/:itemId", deleteGlobalData);

export default router;
