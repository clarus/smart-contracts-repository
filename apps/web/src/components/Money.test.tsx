import { describe, expect, it } from "vitest";
import { formatUsd } from "./Money";

describe("formatUsd", () => {
  it("formats compact TVL values", () => {
    expect(formatUsd(7_420_000_000)).toBe("$7.42B");
    expect(formatUsd(615_000_000)).toBe("$615M");
    expect(formatUsd(null)).toBe("No TVL");
  });
});
