import { Notification } from "../models/Notification.js";

export async function createNotification({ userId, actorId, type, title, body = "", metadata = {} }) {
  return Notification.create({ userId, actorId, type, title, body, metadata });
}
