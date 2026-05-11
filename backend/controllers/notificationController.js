import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listNotifications = asyncHandler(async (request, response) => {
  const notifications = await Notification.find({ userId: request.user._id })
    .populate("actorId", "username profilePicture")
    .sort({ createdAt: -1 })
    .limit(50);

  response.json({ notifications });
});

export const markNotificationRead = asyncHandler(async (request, response) => {
  await Notification.findOneAndUpdate({ _id: request.params.id, userId: request.user._id }, { read: true });
  response.json({ message: "Notification marked as read" });
});
