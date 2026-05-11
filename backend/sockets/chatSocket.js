import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import { processAndStoreMessage } from "../services/messageProcessor.js";

const activeUsers = new Map();

export function registerChatSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id);
      if (!user) return next(new Error("Invalid user"));

      socket.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    activeUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { onlineStatus: true });
    io.emit("presence:update", { userId, onlineStatus: true });

    socket.on("typing:start", ({ receiverId, groupId }) => {
      emitToTarget(io, receiverId, groupId, "typing:start", { userId, username: socket.user.username });
    });

    socket.on("typing:stop", ({ receiverId, groupId }) => {
      emitToTarget(io, receiverId, groupId, "typing:stop", { userId });
    });

    socket.on("message:send", async (payload, callback) => {
      try {
        const message = await processAndStoreMessage({
          senderId: socket.user._id,
          receiverId: payload.receiverId,
          groupId: payload.groupId,
          messageText: payload.messageText
        });

        if (payload.receiverId) {
          await createNotification({
            userId: payload.receiverId,
            actorId: socket.user._id,
            type: message.safetyStatus === "dangerous" ? "threat_alert" : "message",
            title: message.safetyStatus === "dangerous" ? "Dangerous message blocked" : "New message",
            body: socket.user.username
          });
        }

        emitToTarget(io, payload.receiverId, payload.groupId, "message:receive", message);
        callback?.({ ok: true, message });
      } catch (error) {
        callback?.({ ok: false, error: error.message });
      }
    });

    socket.on("disconnect", async () => {
      activeUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { onlineStatus: false });
      io.emit("presence:update", { userId, onlineStatus: false });
    });
  });
}

function emitToTarget(io, receiverId, groupId, event, payload) {
  if (groupId) {
    io.to(`group:${groupId}`).emit(event, payload);
    return;
  }

  const socketId = activeUsers.get(receiverId);
  if (socketId) io.to(socketId).emit(event, payload);
}
