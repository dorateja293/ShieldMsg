import { Friendship } from "../models/Friendship.js";
import { User } from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listFriends = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id).populate(
    "friends",
    "username email bio profilePicture onlineStatus"
  );

  if (!user) {
    return response.status(401).json({ message: "Invalid session" });
  }

  response.json({ users: user.friends });
});

export const sendFriendRequest = asyncHandler(async (request, response) => {
  if (String(request.params.userId) === String(request.user._id)) {
    return response.status(400).json({ message: "Cannot add yourself" });
  }

  const friendship = await Friendship.findOneAndUpdate(
    { requester: request.user._id, recipient: request.params.userId },
    { status: "pending" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await createNotification({
    userId: request.params.userId,
    actorId: request.user._id,
    type: "friend_request",
    title: "New friend request",
    body: `${request.user.username} sent you a friend request.`
  });

  response.status(201).json({ friendship });
});

export const respondToFriendRequest = asyncHandler(async (request, response) => {
  const { action } = request.body;
  const status = action === "accept" ? "accepted" : "rejected";
  const friendship = await Friendship.findOneAndUpdate(
    { _id: request.params.id, recipient: request.user._id },
    { status },
    { new: true }
  );

  if (!friendship) return response.status(404).json({ message: "Friend request not found" });

  if (status === "accepted") {
    await User.bulkWrite([
      { updateOne: { filter: { _id: friendship.requester }, update: { $addToSet: { friends: friendship.recipient } } } },
      { updateOne: { filter: { _id: friendship.recipient }, update: { $addToSet: { friends: friendship.requester } } } }
    ]);

    await createNotification({
      userId: friendship.requester,
      actorId: request.user._id,
      type: "friend_accept",
      title: "Friend request accepted",
      body: `${request.user.username} accepted your request.`
    });
  }

  response.json({ friendship });
});

export const removeFriend = asyncHandler(async (request, response) => {
  await User.bulkWrite([
    { updateOne: { filter: { _id: request.user._id }, update: { $pull: { friends: request.params.userId } } } },
    { updateOne: { filter: { _id: request.params.userId }, update: { $pull: { friends: request.user._id } } } }
  ]);

  await Friendship.updateMany(
    {
      $or: [
        { requester: request.user._id, recipient: request.params.userId },
        { requester: request.params.userId, recipient: request.user._id }
      ]
    },
    { status: "removed" }
  );

  response.json({ message: "Friend removed" });
});

export const listFriendRequests = asyncHandler(async (request, response) => {
  const requests = await Friendship.find({ recipient: request.user._id, status: "pending" }).populate(
    "requester",
    "username profilePicture bio onlineStatus"
  );
  response.json({ requests });
});
