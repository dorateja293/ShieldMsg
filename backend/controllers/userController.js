import { z } from "zod";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const updateProfileSchema = z.object({
  bio: z.string().max(240).optional(),
  profilePicture: z.string().url().or(z.literal("")).optional()
});

export const listUsers = asyncHandler(async (request, response) => {
  const q = request.query.q ?? "";
  const users = await User.find(
    q ? { $text: { $search: q } } : { _id: { $ne: request.user._id } },
    "username email bio profilePicture onlineStatus friends followers following createdAt"
  )
    .limit(25)
    .sort({ onlineStatus: -1, username: 1 });

  response.json({ users });
});

export const getProfile = asyncHandler(async (request, response) => {
  const user = await User.findById(request.params.id)
    .select("username email bio profilePicture onlineStatus friends followers following createdAt")
    .populate("friends", "username profilePicture onlineStatus")
    .populate("followers", "username profilePicture")
    .populate("following", "username profilePicture");

  if (!user) return response.status(404).json({ message: "User not found" });

  response.json({ user });
});

export const updateProfile = asyncHandler(async (request, response) => {
  const payload = updateProfileSchema.parse(request.body);
  const user = await User.findByIdAndUpdate(request.user._id, payload, { new: true });
  response.json({ user: user.toSafeObject() });
});
