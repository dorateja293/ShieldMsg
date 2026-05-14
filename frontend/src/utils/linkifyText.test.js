import { describe, expect, it } from "vitest";
import { splitTextWithUrls } from "./linkifyText.js";

describe("splitTextWithUrls", () => {
  it("wraps a single https URL", () => {
    const text = "see https://example.com/path?q=1 ok";
    expect(splitTextWithUrls(text)).toEqual([
      { type: "text", value: "see " },
      { type: "url", value: "https://example.com/path?q=1" },
      { type: "text", value: " ok" }
    ]);
  });

  it("returns plain text when no URL", () => {
    expect(splitTextWithUrls("hello")).toEqual([{ type: "text", value: "hello" }]);
  });
});
