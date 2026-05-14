import mongoose from "mongoose";
import { Group } from "../models/Group.js";
import { User } from "../models/User.js";
import { ApiError } from "./ApiError.js";

export function parseObjectId(value, label = "id") {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new ApiError(400, `${label} is required`);
  }
  if (!mongoose.isValidObjectId(value)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
  return new mongoose.Types.ObjectId(value);
}

export async function assertCanSendDirectMessage(senderId, receiverIdRaw) {
  const receiverId = parseObjectId(receiverIdRaw, "receiverId");
  if (receiverId.equals(senderId)) {
    throw new ApiError(400, "Cannot message yourself");
  }

  const sender = await User.findById(senderId).select("friends");
  if (!sender) {
    throw new ApiError(401, "Invalid session");
  }

  const isFriend = sender.friends.some((friendId) => friendId.equals(receiverId));
  if (!isFriend) {
    throw new ApiError(403, "You can only exchange messages with friends");
  }

  const receiverExists = await User.exists({ _id: receiverId });
  if (!receiverExists) {
    throw new ApiError(404, "Recipient not found");
  }
}

export async function assertCanSendGroupMessage(senderId, groupIdRaw) {
  const groupId = parseObjectId(groupIdRaw, "groupId");
  const group = await Group.findOne({ _id: groupId, members: senderId }).select("_id");
  if (!group) {
    throw new ApiError(403, "Not a member of this group");
  }
}

export async function assertFriendConversationAccess(viewerId, peerIdRaw) {
  const peerId = parseObjectId(peerIdRaw, "userId");
  if (peerId.equals(viewerId)) {
    throw new ApiError(400, "Invalid peer");
  }
  await assertCanSendDirectMessage(viewerId, peerId);
}
