import express from "express";
import { getGlobalData } from "../controllers/adminController.js";

const router = express.Router();

// Public endpoint - anyone can read global data
router.get("/:type", getGlobalData);

export default router;
