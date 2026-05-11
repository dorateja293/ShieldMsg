import { Message } from "../models/Message.js";
import { createNotification } from "../services/notificationService.js";
import { processAndStoreMessage } from "../services/messageProcessor.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sendMessage = asyncHandler(async (request, response) => {
  const message = await processAndStoreMessage({
    senderId: request.user._id,
    receiverId: request.body.receiverId,
    groupId: request.body.groupId,
    messageText: request.body.messageText,
    file: request.file
  });

  if (request.body.receiverId) {
    await createNotification({
      userId: request.body.receiverId,
      actorId: request.user._id,
      type: message.safetyStatus === "dangerous" ? "threat_alert" : "message",
      title: message.safetyStatus === "dangerous" ? "Dangerous message blocked" : "New message",
      body: message.safetyStatus === "dangerous" ? "SentinelChat blocked a risky message." : request.user.username
    });
  }

  response.status(201).json({ message });
});

export const getConversation = asyncHandler(async (request, response) => {
  const page = Number(request.query.page ?? 1);
  const limit = Math.min(Number(request.query.limit ?? 30), 100);
  const skip = (page - 1) * limit;
  const peerId = request.params.userId;

  const messages = await Message.find({
    $or: [
      { senderId: request.user._id, receiverId: peerId },
      { senderId: peerId, receiverId: request.user._id }
    ]
  })
    .populate("senderId", "username profilePicture onlineStatus")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  response.json({ messages: messages.reverse(), page });
});

export const getGroupMessages = asyncHandler(async (request, response) => {
  const messages = await Message.find({ groupId: request.params.groupId })
    .populate("senderId", "username profilePicture onlineStatus")
    .sort({ createdAt: -1 })
    .limit(50);
  response.json({ messages: messages.reverse() });
});

export const markRead = asyncHandler(async (request, response) => {
  await Message.updateMany(
    { senderId: request.params.userId, receiverId: request.user._id },
    { $addToSet: { readBy: request.user._id } }
  );
  response.json({ message: "Conversation marked as read" });
});
