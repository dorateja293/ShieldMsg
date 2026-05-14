import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { connectDatabase } from "./config/db.js";
import { adminRoutes } from "./routes/adminRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { friendRoutes } from "./routes/friendRoutes.js";
import { messageRoutes } from "./routes/messageRoutes.js";
import { notificationRoutes } from "./routes/notificationRoutes.js";
import { postRoutes } from "./routes/postRoutes.js";
import { uploadRoutes } from "./routes/uploadRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { registerChatSocket } from "./sockets/chatSocket.js";

/** Comma-separated origins (e.g. local Vite + Vercel production). Trailing slashes stripped. */
function clientOriginsFromEnv() {
  const raw = process.env.CLIENT_URL ?? "http://localhost:5173";
  const list = raw
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  return list.length > 0 ? list : ["http://localhost:5173"];
}

const jwtSecret = process.env.JWT_SECRET ?? "";
if (jwtSecret.length < 16) {
  console.error(
    "JWT_SECRET must be set to a secret at least 16 characters long (see backend/.env.example)."
  );
  process.exit(1);
}

const app = express();
const server = createServer(app);
const clientOrigins = clientOriginsFromEnv();
const corsOrigin =
  clientOrigins.length === 1 ? clientOrigins[0] : clientOrigins;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    credentials: true
  }
});

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "sentinelchat-api", timestamp: new Date().toISOString() });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

registerChatSocket(io);

const port = Number(process.env.PORT ?? 5000);

server.listen(port, () => {
  console.log(`SentinelChat API listening on port ${port}`);
});

connectDatabase().catch((error) => {
  console.error("MongoDB connection failed. API is running, but database-backed features require MongoDB.", error.message);
});
