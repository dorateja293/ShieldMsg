import jwt from "jsonwebtoken";
import { Group } from "../models/Group.js";
import { User } from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import { processAndStoreMessage } from "../services/messageProcessor.js";
import { ApiError } from "../utils/ApiError.js";
import {
  assertCanSendDirectMessage,
  assertCanSendGroupMessage,
  parseObjectId
} from "../utils/messageAccess.js";

/** @type {Map<string, number>} */
const connectionCountByUser = new Map();
/** @type {Map<string, Promise<void>>} */
const presenceUpdateQueueByUser = new Map();

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

    socket.join(`user:${userId}`);

    try {
      const groups = await Group.find({ members: socket.user._id }).select("_id");
      for (const g of groups) {
        socket.join(`group:${g._id.toString()}`);
      }
    } catch {
      console.warn(`Failed to preload group rooms for user ${userId}`);
    }

    void queuePresenceUpdate(io, userId, 1);

    socket.on("typing:start", ({ receiverId, groupId }) => {
      emitToTarget(io, receiverId, groupId, "typing:start", { userId, username: socket.user.username });
    });

    socket.on("typing:stop", ({ receiverId, groupId }) => {
      emitToTarget(io, receiverId, groupId, "typing:stop", { userId });
    });

    socket.on("message:send", async (payload, callback) => {
      try {
        const recv = !!(payload?.receiverId != null && String(payload.receiverId).trim());
        const grp = !!(payload?.groupId != null && String(payload.groupId).trim());
        const messageText = typeof payload?.messageText === "string" ? payload.messageText.trim() : "";

        if (recv === grp) {
          throw new ApiError(400, "Provide exactly one of receiverId or groupId");
        }

        if (!recv && !grp) {
          throw new ApiError(400, "receiverId or groupId is required");
        }

        if (!recv && !messageText) {
          throw new ApiError(400, "Message text is required");
        }

        if (recv) {
          await assertCanSendDirectMessage(socket.user._id, payload.receiverId);
        } else {
          await assertCanSendGroupMessage(socket.user._id, payload.groupId);
        }

        const receiverId = recv ? parseObjectId(payload.receiverId, "receiverId") : undefined;
        const groupId = grp ? parseObjectId(payload.groupId, "groupId") : undefined;

        const message = await processAndStoreMessage({
          senderId: socket.user._id,
          receiverId,
          groupId,
          messageText
        });

        if (recv) {
          await createNotification({
            userId: receiverId,
            actorId: socket.user._id,
            type: message.safetyStatus === "dangerous" ? "threat_alert" : "message",
            title: message.safetyStatus === "dangerous" ? "Dangerous message blocked" : "New message",
            body: socket.user.username
          });
        }

        emitToTarget(io, payload.receiverId, payload.groupId, "message:receive", message);
        if (recv) {
          io.to(`user:${socket.user._id.toString()}`).emit("message:receive", message);
        }
        callback?.({ ok: true, message });
      } catch (error) {
        if (error instanceof ApiError) {
          callback?.({ ok: false, error: error.message, statusCode: error.statusCode });
          return;
        }
        callback?.({ ok: false, error: error.message });
      }
    });

    socket.on("disconnect", () => {
      void queuePresenceUpdate(io, userId, -1);
    });
  });
}

/**
 * Track multiple tabs/devices so we don't mark users offline prematurely.
 *
 * @param {import("socket.io").Server} io
 * @param {string} userId
 * @param {1 | -1} delta
 */
async function queuePresenceUpdate(io, userId, delta) {
  const previousUpdate = presenceUpdateQueueByUser.get(userId) ?? Promise.resolve();
  const nextUpdate = previousUpdate.catch(() => {}).then(() => updatePresence(io, userId, delta));

  presenceUpdateQueueByUser.set(userId, nextUpdate);

  try {
    await nextUpdate;
  } finally {
    if (presenceUpdateQueueByUser.get(userId) === nextUpdate) {
      presenceUpdateQueueByUser.delete(userId);
    }
  }
}

async function updatePresence(io, userId, delta) {
  const prev = connectionCountByUser.get(userId) ?? 0;
  const next = prev + delta;

  if (next <= 0) {
    connectionCountByUser.delete(userId);
    await User.findByIdAndUpdate(userId, { onlineStatus: false });
    io.emit("presence:update", { userId, onlineStatus: false });
    return;
  }

  connectionCountByUser.set(userId, next);
  if (delta > 0 && next === 1) {
    await User.findByIdAndUpdate(userId, { onlineStatus: true });
    io.emit("presence:update", { userId, onlineStatus: true });
  }
}

function emitToTarget(io, receiverId, groupId, event, payload) {
  if (groupId) {
    io.to(`group:${String(groupId)}`).emit(event, payload);
    return;
  }

  if (receiverId) {
    io.to(`user:${String(receiverId)}`).emit(event, payload);
  }
}
