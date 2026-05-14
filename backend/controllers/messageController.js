import { Message } from "../models/Message.js";
import { createNotification } from "../services/notificationService.js";
import { processAndStoreMessage } from "../services/messageProcessor.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
  assertCanSendDirectMessage,
  assertCanSendGroupMessage,
  assertFriendConversationAccess,
  parseObjectId
} from "../utils/messageAccess.js";

export const sendMessage = asyncHandler(async (request, response) => {
  const receiverRaw = request.body.receiverId;
  const groupRaw = request.body.groupId;
  const hasReceiver = !!(receiverRaw && String(receiverRaw).trim());
  const hasGroup = !!(groupRaw && String(groupRaw).trim());
  const receiverId = hasReceiver ? parseObjectId(receiverRaw, "receiverId") : undefined;
  const groupId = hasGroup ? parseObjectId(groupRaw, "groupId") : undefined;

  if (hasReceiver === hasGroup) {
    throw new ApiError(400, "Provide exactly one of receiverId or groupId");
  }

  if (hasReceiver) {
    await assertCanSendDirectMessage(request.user._id, receiverRaw);
  } else {
    await assertCanSendGroupMessage(request.user._id, groupRaw);
  }

  const message = await processAndStoreMessage({
    senderId: request.user._id,
    receiverId,
    groupId,
    messageText: request.body.messageText,
    file: request.file
  });

  if (hasReceiver) {
    await createNotification({
      userId: receiverId,
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

  await assertFriendConversationAccess(request.user._id, request.params.userId);
  const peerId = parseObjectId(request.params.userId, "userId");

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
  await assertCanSendGroupMessage(request.user._id, request.params.groupId);

  const page = Number(request.query.page ?? 1);
  const limit = Math.min(Number(request.query.limit ?? 50), 100);
  const skip = (page - 1) * limit;

  const messages = await Message.find({ groupId: request.params.groupId })
    .populate("senderId", "username profilePicture onlineStatus")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  response.json({ messages: messages.reverse(), page });
});

export const markRead = asyncHandler(async (request, response) => {
  await assertFriendConversationAccess(request.user._id, request.params.userId);

  await Message.updateMany(
    { senderId: parseObjectId(request.params.userId, "userId"), receiverId: request.user._id },
    { $addToSet: { readBy: request.user._id } }
  );
  response.json({ message: "Conversation marked as read" });
});
