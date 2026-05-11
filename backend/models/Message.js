import mongoose from "mongoose";

const securityResultSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["safe", "suspicious", "dangerous"], default: "safe" },
    score: { type: Number, min: 0, max: 100, default: 0 },
    reason: { type: String, default: "" },
    source: { type: String, default: "sentinelchat" }
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", index: true },
    messageText: { type: String, default: "", maxlength: 4000 },
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    fileType: { type: String, default: "" },
    detectedLinks: [{ type: String }],
    linkResults: [securityResultSchema],
    fileResult: securityResultSchema,
    safetyStatus: { type: String, enum: ["safe", "suspicious", "dangerous"], default: "safe", index: true },
    threatScore: { type: Number, min: 0, max: 100, default: 0 },
    blocked: { type: Boolean, default: false },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ groupId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
