import { describe, expect, it } from "vitest";
import { normalizeApiBaseUrl, normalizeSocketBaseUrl } from "./apiBaseUrl.js";

describe("normalizeApiBaseUrl", () => {
  it("defaults when missing or empty", () => {
    expect(normalizeApiBaseUrl(undefined)).toBe("http://localhost:5000/api");
    expect(normalizeApiBaseUrl("")).toBe("http://localhost:5000/api");
    expect(normalizeApiBaseUrl("   ")).toBe("http://localhost:5000/api");
  });

  it("appends /api when host has no path", () => {
    expect(normalizeApiBaseUrl("https://sentinelchat.onrender.com")).toBe(
      "https://sentinelchat.onrender.com/api"
    );
  });

  it("preserves explicit /api suffix", () => {
    expect(normalizeApiBaseUrl("https://x.com/api")).toBe("https://x.com/api");
    expect(normalizeApiBaseUrl("https://x.com/api/")).toBe("https://x.com/api");
  });
});

describe("normalizeSocketBaseUrl", () => {
  it("derives from API when socket env unset", () => {
    expect(normalizeSocketBaseUrl(undefined, "https://x.com/api")).toBe("https://x.com");
  });

  it("uses VITE_SOCKET_URL when set", () => {
    expect(normalizeSocketBaseUrl("https://x.com/", undefined)).toBe("https://x.com");
  });
});
