import { Router } from "express";
import { getSecurityAnalytics } from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireAdmin);
adminRoutes.get("/security", getSecurityAnalytics);
