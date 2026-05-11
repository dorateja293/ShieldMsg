import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    body: { type: String, required: true, maxlength: 1000 },
    mediaUrl: { type: String, default: "" },
    detectedLinks: [{ type: String }],
    safetyStatus: { type: String, enum: ["safe", "suspicious", "dangerous"], default: "safe" },
    threatScore: { type: Number, min: 0, max: 100, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);
