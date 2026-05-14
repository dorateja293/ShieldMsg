import { describe, expect, it } from "vitest";
import { mediaUrl } from "./mediaUrl.js";

describe("mediaUrl", () => {
  it("returns absolute URLs unchanged", () => {
    expect(mediaUrl("https://x.com/a.png")).toBe("https://x.com/a.png");
  });

  it("resolves /uploads to a usable URL (same-origin in browser, or API origin in Node)", () => {
    const u = mediaUrl("/uploads/a.jpg");
    expect(u.endsWith("/uploads/a.jpg")).toBe(true);
  });
});
