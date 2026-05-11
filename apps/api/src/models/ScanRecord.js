import { model, Schema } from "mongoose";

const scanReasonSchema = new Schema(
  {
    code: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ["safe", "suspicious", "dangerous"], required: true }
  },
  { _id: false }
);

const scanResultSchema = new Schema(
  {
    target: { type: String, required: true },
    type: { type: String, enum: ["url", "file"], required: true },
    level: { type: String, enum: ["safe", "suspicious", "dangerous"], required: true },
    score: { type: Number, required: true },
    reasons: { type: [scanReasonSchema], required: true },
    recommendation: { type: String, required: true },
    scannedAt: { type: String, required: true }
  },
  { _id: false }
);

const fileInputSchema = new Schema(
  {
    name: { type: String, required: true },
    mimeType: { type: String },
    sizeBytes: { type: Number }
  },
  { _id: false }
);

const scanRecordSchema = new Schema(
  {
    text: { type: String, default: "" },
    files: { type: [fileInputSchema], default: [] },
    level: { type: String, enum: ["safe", "suspicious", "dangerous"], required: true },
    score: { type: Number, required: true },
    urls: { type: [scanResultSchema], default: [] },
    fileResults: { type: [scanResultSchema], default: [] },
    summary: { type: String, required: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false
  }
);

scanRecordSchema.index({ createdAt: -1 });
scanRecordSchema.index({ level: 1, createdAt: -1 });

export const ScanRecordModel = model("ScanRecord", scanRecordSchema);
