import { Router } from "express";
import { getProfile, listUsers, updateProfile } from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";

export const userRoutes = Router();

userRoutes.use(requireAuth);
userRoutes.get("/", listUsers);
userRoutes.get("/:id", getProfile);
userRoutes.patch("/me/profile", updateProfile);
