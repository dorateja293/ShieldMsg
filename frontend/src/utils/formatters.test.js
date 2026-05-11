import { describe, expect, it } from "vitest";
import { shortName } from "./formatters.js";

describe("shortName", () => {
  it("returns a two-letter uppercase avatar label", () => {
    expect(shortName("sentinel")).toBe("SE");
  });
});
