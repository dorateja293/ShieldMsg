import { classifyThreat } from "../utils/threatScore.js";

const suspiciousKeywords = [
  "login",
  "verify",
  "password",
  "wallet",
  "airdrop",
  "bonus",
  "free",
  "gift",
  "urgent",
  "security",
  "update",
  "account",
  "recover"
];

const knownBrands = ["amazon", "google", "paypal", "instagram", "whatsapp", "facebook", "microsoft", "apple"];

export function analyzePhishingSignals(url) {
  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    return {
      status: "dangerous",
      score: 85,
      reason: "Malformed URL detected."
    };
  }

  const host = parsed.hostname.toLowerCase();
  const href = parsed.href.toLowerCase();
  let score = 0;
  const reasons = [];

  if (href.length > 120) {
    score += 12;
    reasons.push("URL is unusually long.");
  }

  if ((host.match(/\./g) ?? []).length >= 3) {
    score += 14;
    reasons.push("Domain uses excessive subdomains.");
  }

  if (/[0-9]/.test(host) && knownBrands.some((brand) => host.includes(brand.replace("o", "0")) || host.includes(brand))) {
    score += 24;
    reasons.push("Domain appears to use brand lookalike characters.");
  }

  const keywordHits = suspiciousKeywords.filter((keyword) => href.includes(keyword));
  if (keywordHits.length) {
    score += Math.min(30, keywordHits.length * 8);
    reasons.push("URL contains social-engineering keywords.");
  }

  if (host.includes("-")) {
    score += 8;
    reasons.push("Domain uses hyphenated wording common in phishing.");
  }

  if (/[^\w.-]/.test(host) || host.includes("xn--")) {
    score += 20;
    reasons.push("Domain may contain lookalike or encoded characters.");
  }

  const entropy = calculateEntropy(href);
  if (entropy > 4.2) {
    score += 10;
    reasons.push("URL has high character entropy.");
  }

  score = Math.min(100, score);
  return {
    status: classifyThreat(score),
    score,
    reason: reasons.join(" ") || "No AI phishing signals detected."
  };
}

function calculateEntropy(value) {
  const frequencies = [...value].reduce((map, char) => map.set(char, (map.get(char) ?? 0) + 1), new Map());
  return [...frequencies.values()].reduce((entropy, count) => {
    const probability = count / value.length;
    return entropy - probability * Math.log2(probability);
  }, 0);
}
