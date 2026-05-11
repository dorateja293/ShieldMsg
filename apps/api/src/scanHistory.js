import mongoose from "mongoose";
import { ScanRecordModel } from "./models/ScanRecord.js";

const memoryHistory = [];

export async function saveScanRecord(payload) {
  if (isMongoConnected()) {
    const record = await ScanRecordModel.create(payload);
    return toView(record);
  }

  const record = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  memoryHistory.unshift(record);
  memoryHistory.splice(25);
  return record;
}

export async function listRecentScanRecords(limit = 10) {
  if (isMongoConnected()) {
    const records = await ScanRecordModel.find().sort({ createdAt: -1 }).limit(limit).lean();
    return records.map(toView);
  }

  return memoryHistory.slice(0, limit);
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function toView(record) {
  return {
    id: record._id?.toString() ?? crypto.randomUUID(),
    text: record.text,
    files: record.files,
    level: record.level,
    score: record.score,
    urls: record.urls,
    fileResults: record.fileResults,
    summary: record.summary,
    createdAt: record.createdAt.toISOString()
  };
}
