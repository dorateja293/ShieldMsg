import { Router } from "express";
import { getConversation, getGroupMessages, markRead, sendMessage } from "../controllers/messageController.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

export const messageRoutes = Router();

messageRoutes.use(requireAuth);
messageRoutes.post("/", upload.single("file"), sendMessage);
messageRoutes.get("/conversation/:userId", getConversation);
messageRoutes.get("/group/:groupId", getGroupMessages);
messageRoutes.patch("/conversation/:userId/read", markRead);
