import { z } from "zod";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../middleware/auth.js";

const registerSchema = z.object({
  username: z.string().min(3).max(32),
  email: z.string().email(),
  password: z.string().min(8),
  bio: z.string().max(240).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const register = asyncHandler(async (request, response) => {
  const payload = registerSchema.parse(request.body);
  const user = await User.create(payload);
  const token = signToken(user);

  response.status(201).json({
    token,
    user: user.toSafeObject()
  });
});

export const login = asyncHandler(async (request, response) => {
  const { email, password } = loginSchema.parse(request.body);
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return response.status(401).json({ message: "Invalid email or password" });
  }

  user.onlineStatus = true;
  await user.save();

  response.json({
    token: signToken(user),
    user: user.toSafeObject()
  });
});

export const me = asyncHandler(async (request, response) => {
  response.json({ user: request.user.toSafeObject() });
});
