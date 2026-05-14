import { Router } from "express";
import {
  listFriendRequests,
  listFriends,
  removeFriend,
  respondToFriendRequest,
  sendFriendRequest
} from "../controllers/friendController.js";
import { requireAuth } from "../middleware/auth.js";

export const friendRoutes = Router();

friendRoutes.use(requireAuth);
friendRoutes.get("/", listFriends);
friendRoutes.get("/requests", listFriendRequests);
friendRoutes.post("/:userId/request", sendFriendRequest);
friendRoutes.patch("/requests/:id", respondToFriendRequest);
friendRoutes.delete("/:userId", removeFriend);
