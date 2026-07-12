import { describe, expect, it } from "vitest";
import { formatMoney, inputToRial, normalizePersianDigits, parsePersianMoneyInput, splitAmountEqually, toRial } from "./money";

describe("money", () => {
  it("accepts Persian and English digits", () => { expect(normalizePersianDigits("۱۲3٤")).toBe("1234"); expect(parsePersianMoneyInput("۲۵۰٬۰۰۰")).toBe(250000n); });
  it("converts toman to integer rial", () => expect(toRial(10_000n, "TOMAN")).toBe(100_000n));
  it("converts million toman to integer rial", () => expect(inputToRial(2n, "MILLION_TOMAN")).toBe(20_000_000n));
  it("formats rial and toman with Persian digits", () => { expect(formatMoney(2_500_000n, "TOMAN")).toBe("۲۵۰٬۰۰۰ تومان"); expect(formatMoney(2_500_000n, "RIAL")).toBe("۲٬۵۰۰٬۰۰۰ ریال"); });
  it("rejects invalid values", () => expect(() => parsePersianMoneyInput("۱۲x")).toThrow());
  it("splits without losing a rial", () => expect(splitAmountEqually(10n, ["c", "a", "b"]).reduce((sum, item) => sum + item.shareRial, 0n)).toBe(10n));
});
