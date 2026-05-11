import axios from "axios";
import { analyzePhishingSignals } from "./aiPhishingDetector.js";
import { classifyThreat, combineThreatResults } from "../utils/threatScore.js";

const suspiciousTlds = new Set(["zip", "mov", "top", "xyz", "click", "tk", "gq", "cf", "ml", "ga"]);
const shorteners = new Set(["bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "rebrand.ly", "shorturl.at"]);

export async function scanLink(url) {
  const localResult = scanLocalUrlSignals(url);
  const aiResult = analyzePhishingSignals(url);
  const externalResults = await Promise.allSettled([scanWithVirusTotal(url), scanWithGoogleSafeBrowsing(url)]);
  const apiResults = externalResults
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => result.value);

  return combineThreatResults([localResult, aiResult, ...apiResults]);
}

function scanLocalUrlSignals(url) {
  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    return { status: "dangerous", score: 90, reason: "Invalid URL format." };
  }

  const reasons = [];
  let score = 0;
  const host = parsed.hostname.toLowerCase();
  const tld = host.split(".").at(-1);

  if (parsed.protocol !== "https:") {
    score += 16;
    reasons.push("Link does not use HTTPS.");
  }

  if (shorteners.has(host)) {
    score += 24;
    reasons.push("Shortened URL hides the destination.");
  }

  if (tld && suspiciousTlds.has(tld)) {
    score += 18;
    reasons.push(`.${tld} domains are frequently abused.`);
  }

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    score += 35;
    reasons.push("URL uses a raw IP address.");
  }

  return {
    status: classifyThreat(score),
    score,
    reason: reasons.join(" ") || "No local URL threat signals detected."
  };
}

async function scanWithVirusTotal(url) {
  if (!process.env.VIRUSTOTAL_API_KEY) return null;

  const encodedUrlId = Buffer.from(url).toString("base64url");
  const response = await axios.get(`https://www.virustotal.com/api/v3/urls/${encodedUrlId}`, {
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
    reason: `VirusTotal reported ${malicious} malicious and ${suspicious} suspicious URL detections.`
  };
}

async function scanWithGoogleSafeBrowsing(url) {
  if (!process.env.GOOGLE_SAFE_BROWSING_API_KEY) return null;

  const response = await axios.post(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`,
    {
      client: { clientId: "sentinelchat", clientVersion: "0.1.0" },
      threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url }]
      }
    },
    { timeout: 8000 }
  );

  const matches = response.data?.matches ?? [];
  const score = matches.length ? 90 : 0;

  return {
    status: classifyThreat(score),
    score,
    reason: matches.length ? "Google Safe Browsing matched a known threat." : "Google Safe Browsing found no match."
  };
}
