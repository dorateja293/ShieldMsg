import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export async function requireAuth(request, response, next) {
  try {
    const header = request.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : request.cookies?.token;

    if (!token) {
      return response.status(401).json({ message: "Authentication required" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return response.status(401).json({ message: "Invalid session" });
    }

    request.user = user;
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(request, response, next) {
  if (request.user?.role !== "admin") {
    return response.status(403).json({ message: "Admin access required" });
  }

  next();
}

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d"
  });
}
