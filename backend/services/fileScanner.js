import fs from "node:fs/promises";
import crypto from "node:crypto";
import axios from "axios";
import { classifyThreat, combineThreatResults } from "../utils/threatScore.js";

const dangerousExtensions = new Set(["apk", "exe", "scr", "bat", "cmd", "msi", "jar", "vbs", "ps1"]);
const suspiciousExtensions = new Set(["zip", "rar", "7z", "iso", "docm", "xlsm"]);

export async function scanUploadedFile(file) {
  if (!file) {
    return { status: "safe", score: 0, malwareDetected: false, reason: "No file attached." };
  }

  const hash = await hashFile(file.path);
  const localResult = scanLocalFileSignals(file);
  const virusTotalResult = await scanFileHashWithVirusTotal(hash);
  const combined = combineThreatResults([localResult, virusTotalResult].filter(Boolean));

  return {
    ...combined,
    malwareDetected: combined.status === "dangerous",
    hash,
    reason: combined.reason
  };
}

async function hashFile(filePath) {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function scanLocalFileSignals(file) {
  const extension = file.originalname.split(".").pop()?.toLowerCase() ?? "";
  let score = 0;
  const reasons = [];

  if (dangerousExtensions.has(extension)) {
    score += 70;
    reasons.push(`.${extension} files can execute code or install apps.`);
  }

  if (suspiciousExtensions.has(extension)) {
    score += 35;
    reasons.push(`.${extension} files may hide active or compressed content.`);
  }

  if (/\.[a-z0-9]{2,5}\.(apk|exe|scr|bat|cmd|msi|jar|vbs|ps1)$/i.test(file.originalname)) {
    score += 25;
    reasons.push("File uses a deceptive double extension.");
  }

  if (file.size > 100 * 1024 * 1024) {
    score += 10;
    reasons.push("File is unusually large for messaging.");
  }

  return {
    status: classifyThreat(score),
    score: Math.min(100, score),
    reason: reasons.join(" ") || "No local file threat signals detected."
  };
}

async function scanFileHashWithVirusTotal(hash) {
  if (!process.env.VIRUSTOTAL_API_KEY) return null;

  try {
    const response = await axios.get(`https://www.virustotal.com/api/v3/files/${hash}`, {
      headers: { "x-apikey": process.env.VIRUSTOTAL_API_KEY },
      timeout: 8000
    });

    const stats = response.data?.data?.attributes?.last_analysis_stats ?? {};
    const malicious = stats.malicious ?? 0;
    const suspicious = stats.suspicious ?? 0;
    const score = Math.min(100, malicious * 30 + suspicious * 15);

    return {
      status: classifyThreat(score),
      score,
      reason: `VirusTotal reported ${malicious} malicious and ${suspicious} suspicious file detections.`
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return { status: "safe", score: 5, reason: "File hash was not found in VirusTotal." };
    }

    throw error;
  }
}
