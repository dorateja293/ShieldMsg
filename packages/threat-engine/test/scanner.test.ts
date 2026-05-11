import { describe, expect, it } from "vitest";
import { scanFile, scanUrl } from "../src/index";

describe("scanUrl", () => {
  it("marks trusted HTTPS links as safe", () => {
    const result = scanUrl("https://instagram.com/accounts/login");

    expect(result.level).toBe("safe");
    expect(result.score).toBeLessThan(25);
  });

  it("flags shortened scam-like links as suspicious", () => {
    const result = scanUrl("https://bit.ly/free-gift-verify");

    expect(result.level).toBe("suspicious");
    expect(result.reasons.map((reason) => reason.code)).toContain("shortened_link");
  });

  it("flags brand impersonation and executable downloads as dangerous", () => {
    const result = scanUrl("http://whatsapp-security-update.xyz/install.apk");

    expect(result.level).toBe("dangerous");
    expect(result.reasons.map((reason) => reason.code)).toEqual(
      expect.arrayContaining(["plain_http", "risky_tld", "executable_download", "brand_impersonation"])
    );
  });
});

describe("scanFile", () => {
  it("marks normal PDFs as safe", () => {
    const result = scanFile({ name: "semester-notes.pdf", mimeType: "application/pdf", sizeBytes: 400_000 });

    expect(result.level).toBe("safe");
  });

  it("flags APK files as dangerous", () => {
    const result = scanFile({
      name: "whatsapp-update.apk",
      mimeType: "application/vnd.android.package-archive",
      sizeBytes: 8_000_000
    });

    expect(result.level).toBe("dangerous");
    expect(result.reasons.map((reason) => reason.code)).toContain("executable_file");
  });

  it("flags deceptive double extensions as dangerous", () => {
    const result = scanFile({ name: "invoice.pdf.exe", sizeBytes: 900_000 });

    expect(result.level).toBe("dangerous");
    expect(result.reasons.map((reason) => reason.code)).toContain("double_extension");
  });
});
