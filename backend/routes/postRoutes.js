import { Router } from "express";
import { createPost, getFeed } from "../controllers/postController.js";
import { requireAuth } from "../middleware/auth.js";

export const postRoutes = Router();

postRoutes.use(requireAuth);
postRoutes.get("/", getFeed);
postRoutes.post("/", createPost);
