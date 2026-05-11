import { describe, expect, it } from "vitest";
import { analyzePhishingSignals } from "../services/aiPhishingDetector.js";
import { extractLinks } from "../utils/extractLinks.js";
import { classifyThreat } from "../utils/threatScore.js";

describe("extractLinks", () => {
  it("extracts multiple HTTP and HTTPS URLs", () => {
    expect(extractLinks("Open https://example.com and http://test.local/a")).toEqual([
      "https://example.com",
      "http://test.local/a"
    ]);
  });
});

describe("threat scoring", () => {
  it("classifies scores into safe, suspicious, and dangerous ranges", () => {
    expect(classifyThreat(20)).toBe("safe");
    expect(classifyThreat(55)).toBe("suspicious");
    expect(classifyThreat(90)).toBe("dangerous");
  });
});

describe("AI phishing detector", () => {
  it("flags lookalike brand login domains", () => {
    const result = analyzePhishingSignals("https://amaz0n-security-login.com/verify-password");
    expect(result.status).not.toBe("safe");
    expect(result.score).toBeGreaterThan(30);
  });
});
