import { Router } from "express";
import { uploadAndScan } from "../controllers/uploadController.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

export const uploadRoutes = Router();

uploadRoutes.post("/", requireAuth, upload.single("file"), uploadAndScan);
