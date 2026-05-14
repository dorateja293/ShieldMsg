import { io } from "socket.io-client";
import { getSocketBaseUrl } from "../config/apiBaseUrl.js";

let socket;

export function getSocket() {
  const token = localStorage.getItem("sentinelchat_token");

  if (!socket) {
    socket = io(getSocketBaseUrl(), {
      autoConnect: false,
      auth: { token }
    });
  }

  socket.auth = { token: token ?? undefined };
  return socket;
}

/** Clears auth and drops the Socket.IO connection (e.g. logout or 401). */
export function logoutSocket() {
  if (!socket) return;
  socket.auth = {};
  socket.disconnect();
}
