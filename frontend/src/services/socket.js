import { io } from "socket.io-client";

let socket;

export function getSocket() {
  const token = localStorage.getItem("sentinelchat_token");

  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000", {
      autoConnect: false,
      auth: { token }
    });
  }

  socket.auth = { token };
  return socket;
}
