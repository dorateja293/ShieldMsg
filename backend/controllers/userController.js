import { z } from "zod";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const updateProfileSchema = z
  .object({
    bio: z.string().max(240).optional(),
    profilePicture: z.string().max(2048).optional()
  })
  .superRefine((data, ctx) => {
    const pic = data.profilePicture;
    if (pic === undefined || pic === "") return;
    if (!/^https?:\/\//i.test(pic) && !pic.startsWith("/uploads/")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["profilePicture"],
        message: "Profile picture must be a full URL or an uploaded file under /uploads/"
      });
    }
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
  const targetId = request.params.id;
  const isSelf = String(request.user._id) === String(targetId);
  const fields = isSelf
    ? "username email bio profilePicture onlineStatus friends followers following createdAt"
    : "username bio profilePicture onlineStatus friends followers following createdAt";

  const user = await User.findById(targetId)
    .select(fields)
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
