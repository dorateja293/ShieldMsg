import "dotenv/config";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { scanFile, scanUrl } from "@shieldmsg/threat-engine";
import { connectDatabase } from "./db.js";
import { listRecentScanRecords, saveScanRecord } from "./scanHistory.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

const fileSchema = z.object({
  name: z.string().min(1),
  mimeType: z.string().optional(),
  sizeBytes: z.number().int().nonnegative().optional()
});

const urlScanSchema = z.object({
  url: z.string().min(1)
});

const fileScanSchema = z.object({
  file: fileSchema
});

const messageScanSchema = z.object({
  text: z.string().default(""),
  files: z.array(fileSchema).default([])
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "*" }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "shieldmsg-api",
    timestamp: new Date().toISOString()
  });
});

app.post("/scan/url", (request, response) => {
  const { url } = urlScanSchema.parse(request.body);
  response.json(scanUrl(url));
});

app.post("/scan/file", (request, response) => {
  const { file } = fileScanSchema.parse(request.body);
  response.json(scanFile(file));
});

app.post("/scan/message", async (request, response) => {
  const { text, files } = messageScanSchema.parse(request.body);
  const urlResults = extractUrls(text).map(scanUrl);
  const fileResults = files.map((file) => scanFile(file));
  const results = [...urlResults, ...fileResults];
  const scan = {
    level: highestRisk(results),
    score: results.length ? Math.max(...results.map((result) => result.score)) : 0,
    urls: urlResults,
    files: fileResults,
    summary: summarizeMessage(results),
    scannedAt: new Date().toISOString()
  };

  await saveScanRecord({
    text,
    files,
    level: scan.level,
    score: scan.score,
    urls: scan.urls,
    fileResults: scan.files,
    summary: scan.summary
  });

  response.json(scan);
});

app.get("/scan/history", async (request, response) => {
  const limit = z.coerce.number().int().min(1).max(25).default(10).parse(request.query.limit);
  response.json({
    records: await listRecentScanRecords(limit)
  });
});

const errorHandler = (error, _request, response, _next) => {
  if (error instanceof z.ZodError) {
    response.status(400).json({
      error: "Invalid request payload",
      details: error.flatten()
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: "Scan service failed unexpectedly"
  });
};

app.use(errorHandler);

connectDatabase().finally(() => {
  app.listen(port, () => {
    console.log(`ShieldMsg API listening on http://localhost:${port}`);
  });
});

function extractUrls(text) {
  const matches = text.match(/\bhttps?:\/\/[^\s<>"']+|\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"']*)?/gi);
  return [...new Set(matches ?? [])];
}

function highestRisk(results) {
  if (results.some((result) => result.level === "dangerous")) return "dangerous";
  if (results.some((result) => result.level === "suspicious")) return "suspicious";
  return "safe";
}

function summarizeMessage(results) {
  if (results.length === 0) return "No links or files were detected in this message.";

  const level = highestRisk(results);
  if (level === "dangerous") return "Dangerous content was detected. Do not open it until verified.";
  if (level === "suspicious") return "Some content needs caution. Verify the sender before opening.";
  return "No obvious risk signals were detected in the shared content.";
}
