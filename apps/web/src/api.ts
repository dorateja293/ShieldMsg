export type RiskLevel = "safe" | "suspicious" | "dangerous";

export interface ScanReason {
  code: string;
  message: string;
  severity: RiskLevel;
}

export interface ScanResult {
  target: string;
  type: "url" | "file";
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

export interface MessageScanResult {
  level: RiskLevel;
  score: number;
  urls: ScanResult[];
  files: ScanResult[];
  summary: string;
  scannedAt: string;
}

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export async function scanMessage(text: string, files: FileScanInput[]): Promise<MessageScanResult> {
  const response = await fetch(`${apiBaseUrl}/scan/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text, files })
  });

  if (!response.ok) {
    throw new Error("Unable to scan message content");
  }

  return response.json() as Promise<MessageScanResult>;
}
