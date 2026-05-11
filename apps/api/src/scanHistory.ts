import mongoose from "mongoose";
import type { RiskLevel, ScanResult } from "@shieldmsg/threat-engine";
import { ScanRecordModel, type MessageScanRecord } from "./models/ScanRecord.js";

export interface FileInput {
  name: string;
  mimeType?: string;
  sizeBytes?: number;
}

export interface MessageScanPayload {
  text: string;
  files: FileInput[];
  level: RiskLevel;
  score: number;
  urls: ScanResult[];
  fileResults: ScanResult[];
  summary: string;
}

export interface MessageScanView extends MessageScanPayload {
  id: string;
  createdAt: string;
}

const memoryHistory: MessageScanView[] = [];

export async function saveScanRecord(payload: MessageScanPayload): Promise<MessageScanView> {
  if (isMongoConnected()) {
    const record = await ScanRecordModel.create(payload);
    return toView(record);
  }

  const record: MessageScanView = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  };

  memoryHistory.unshift(record);
  memoryHistory.splice(25);
  return record;
}

export async function listRecentScanRecords(limit = 10): Promise<MessageScanView[]> {
  if (isMongoConnected()) {
    const records = await ScanRecordModel.find().sort({ createdAt: -1 }).limit(limit).lean<MessageScanRecord[]>();
    return records.map(toView);
  }

  return memoryHistory.slice(0, limit);
}

function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

function toView(record: MessageScanRecord): MessageScanView {
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
