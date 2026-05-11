import mongoose from "mongoose";

const threatLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", index: true },
    target: { type: String, required: true },
    targetType: { type: String, enum: ["url", "file"], required: true },
    status: { type: String, enum: ["safe", "suspicious", "dangerous"], required: true, index: true },
    score: { type: Number, min: 0, max: 100, required: true },
    reason: { type: String, default: "" },
    domain: { type: String, default: "", index: true },
    fileType: { type: String, default: "", index: true },
    source: { type: String, default: "sentinelchat" }
  },
  { timestamps: true }
);

threatLogSchema.index({ createdAt: -1 });
threatLogSchema.index({ status: 1, createdAt: -1 });

export const ThreatLog = mongoose.model("ThreatLog", threatLogSchema);
