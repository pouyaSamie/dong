import { describe, expect, it } from "vitest";
import { splitAmountEqually } from "@/lib/money";
describe("expense shares", () => { for (const count of [1, 6, 10]) it(`splits exactly for ${count} participants`, () => { const shares = splitAmountEqually(1_000_003n, Array.from({ length: count }, (_, index) => String(index))); expect(shares).toHaveLength(count); expect(shares.reduce((sum, share) => sum + share.shareRial, 0n)).toBe(1_000_003n); expect(shares[0].shareRial - shares.at(-1)!.shareRial).toBeLessThanOrEqual(1n); }); });
