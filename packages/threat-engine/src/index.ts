export type ContentType = "url" | "file";
export type RiskLevel = "safe" | "suspicious" | "dangerous";

export interface ScanReason {
  code: string;
  message: string;
  severity: RiskLevel;
}

export interface ScanResult {
  target: string;
  type: ContentType;
  level: RiskLevel;
  score: number;
  reasons: ScanReason[];
  recommendation: string;
  scannedAt: string;
}

export interface FileScanInput {
  name: string;
  mimeType?: string;
  sizeBytes?: number;
}

const shortenerHosts = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "cutt.ly",
  "is.gd",
  "rebrand.ly",
  "shorturl.at",
  "s.id"
]);

const riskyTlds = new Set(["zip", "mov", "top", "xyz", "click", "tk", "gq", "cf", "ml", "ga"]);
const executableExtensions = new Set(["apk", "exe", "scr", "bat", "cmd", "msi", "jar", "vbs", "ps1"]);
const macroExtensions = new Set(["docm", "xlsm", "pptm"]);
const archiveExtensions = new Set(["zip", "rar", "7z", "iso"]);

const suspiciousKeywords = [
  "verify",
  "password",
  "wallet",
  "airdrop",
  "free",
  "gift",
  "urgent",
  "bonus",
  "crack",
  "mod",
  "update-now"
];

const trustedBrandDomains: Record<string, string[]> = {
  whatsapp: ["whatsapp.com"],
  instagram: ["instagram.com", "cdninstagram.com"],
  google: ["google.com", "accounts.google.com"],
  paypal: ["paypal.com"],
  amazon: ["amazon.com"]
};

export function scanUrl(rawUrl: string): ScanResult {
  const reasons: ScanReason[] = [];
  const normalizedInput = rawUrl.trim();
  let score = 0;
  let parsed: URL;

  try {
    parsed = new URL(normalizedInput.includes("://") ? normalizedInput : `https://${normalizedInput}`);
  } catch {
    return buildResult({
      target: rawUrl,
      type: "url",
      score: 80,
      reasons: [
        {
          code: "invalid_url",
          message: "The link is malformed and should not be opened.",
          severity: "dangerous"
        }
      ]
    });
  }

  const host = parsed.hostname.toLowerCase();
  const labels = host.split(".");
  const extension = getExtension(parsed.pathname);

  if (parsed.protocol === "http:") {
    score += 15;
    reasons.push(reason("plain_http", "The link does not use HTTPS encryption.", "suspicious"));
  }

  if (shortenerHosts.has(host)) {
    score += 25;
    reasons.push(reason("shortened_link", "The destination is hidden behind a URL shortener.", "suspicious"));
  }

  if (isIpAddress(host)) {
    score += 30;
    reasons.push(reason("ip_hostname", "The link uses a raw IP address instead of a domain name.", "dangerous"));
  }

  if (host.includes("xn--")) {
    score += 25;
    reasons.push(reason("punycode_domain", "The domain may be using lookalike characters.", "dangerous"));
  }

  const tld = labels.at(-1);
  if (tld && riskyTlds.has(tld)) {
    score += 15;
    reasons.push(reason("risky_tld", `The .${tld} domain is commonly abused in phishing campaigns.`, "suspicious"));
  }

  if (labels.length > 4) {
    score += 10;
    reasons.push(reason("deep_subdomain", "The link has an unusually deep subdomain chain.", "suspicious"));
  }

  if (parsed.href.length > 140) {
    score += 10;
    reasons.push(reason("long_url", "The link is unusually long and may be hiding tracking or redirect data.", "suspicious"));
  }

  if (extension && executableExtensions.has(extension)) {
    score += 45;
    reasons.push(reason("executable_download", `The link points to a .${extension} executable download.`, "dangerous"));
  }

  const keywordHits = suspiciousKeywords.filter((keyword) => parsed.href.toLowerCase().includes(keyword));
  if (keywordHits.length > 0) {
    score += Math.min(25, keywordHits.length * 8);
    reasons.push(reason("social_engineering_terms", "The link contains words often used in scams.", "suspicious"));
  }

  const impersonatedBrand = detectBrandImpersonation(host);
  if (impersonatedBrand) {
    score += 35;
    reasons.push(reason("brand_impersonation", `The domain appears to imitate ${impersonatedBrand}.`, "dangerous"));
  }

  if (score === 0) {
    reasons.push(reason("no_risk_signals", "No obvious risk signals were found in this link.", "safe"));
  }

  return buildResult({
    target: parsed.href,
    type: "url",
    score,
    reasons
  });
}

export function scanFile(input: FileScanInput): ScanResult {
  const reasons: ScanReason[] = [];
  let score = 0;
  const fileName = input.name.trim();
  const extension = getExtension(fileName);
  const lowerName = fileName.toLowerCase();

  if (!fileName) {
    return buildResult({
      target: "unnamed file",
      type: "file",
      score: 70,
      reasons: [reason("missing_filename", "The file has no visible name.", "dangerous")]
    });
  }

  if (hasDoubleExtension(lowerName)) {
    score += 35;
    reasons.push(reason("double_extension", "The file uses a deceptive double extension.", "dangerous"));
  }

  if (extension && executableExtensions.has(extension)) {
    score += 50;
    reasons.push(reason("executable_file", `.${extension} files can install or execute code on a device.`, "dangerous"));
  }

  if (extension && macroExtensions.has(extension)) {
    score += 35;
    reasons.push(reason("macro_document", "Macro-enabled Office documents can execute embedded scripts.", "dangerous"));
  }

  if (extension && archiveExtensions.has(extension)) {
    score += 15;
    reasons.push(reason("archive_file", "Compressed files can hide dangerous content until extracted.", "suspicious"));
  }

  const keywordHits = suspiciousKeywords.filter((keyword) => lowerName.includes(keyword));
  if (keywordHits.length > 0) {
    score += Math.min(20, keywordHits.length * 7);
    reasons.push(reason("risky_filename", "The filename contains terms often used in social engineering.", "suspicious"));
  }

  if (input.sizeBytes && input.sizeBytes > 100 * 1024 * 1024) {
    score += 10;
    reasons.push(reason("large_file", "The file is unusually large for casual messaging.", "suspicious"));
  }

  if (!extension) {
    score += 12;
    reasons.push(reason("missing_extension", "The file type is not clear from its name.", "suspicious"));
  }

  if (input.mimeType?.includes("android.package-archive")) {
    score += 35;
    reasons.push(reason("android_package", "Android package files can install applications outside trusted stores.", "dangerous"));
  }

  if (score === 0) {
    reasons.push(reason("no_risk_signals", "No obvious risk signals were found in this file.", "safe"));
  }

  return buildResult({
    target: fileName,
    type: "file",
    score,
    reasons
  });
}

function buildResult(input: Omit<ScanResult, "level" | "recommendation" | "scannedAt">): ScanResult {
  const normalizedScore = Math.min(100, Math.max(0, input.score));
  const level = toRiskLevel(normalizedScore);

  return {
    ...input,
    score: normalizedScore,
    level,
    recommendation: recommendationFor(level),
    scannedAt: new Date().toISOString()
  };
}

function toRiskLevel(score: number): RiskLevel {
  if (score >= 60) return "dangerous";
  if (score >= 25) return "suspicious";
  return "safe";
}

function recommendationFor(level: RiskLevel): string {
  if (level === "dangerous") return "Do not open this content. Delete it or verify through a trusted channel.";
  if (level === "suspicious") return "Open only if you trust the sender and can verify the source.";
  return "No obvious threat signals were detected. Stay cautious with unknown senders.";
}

function reason(code: string, message: string, severity: RiskLevel): ScanReason {
  return { code, message, severity };
}

function getExtension(value: string): string | undefined {
  const cleanValue = value.split(/[?#]/)[0] ?? value;
  const lastSegment = cleanValue.split("/").pop() ?? cleanValue;
  const dotIndex = lastSegment.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === lastSegment.length - 1) return undefined;
  return lastSegment.slice(dotIndex + 1).toLowerCase();
}

function isIpAddress(host: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(":");
}

function hasDoubleExtension(fileName: string): boolean {
  return /\.[a-z0-9]{2,5}\.(apk|exe|scr|bat|cmd|msi|jar|vbs|ps1)$/i.test(fileName);
}

function detectBrandImpersonation(host: string): string | undefined {
  return Object.entries(trustedBrandDomains).find(([brand, officialDomains]) => {
    const mentionsBrand = host.includes(brand);
    const isOfficial = officialDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
    return mentionsBrand && !isOfficial;
  })?.[0];
}
