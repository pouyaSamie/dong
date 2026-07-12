import { describe, expect, it } from "vitest";
import { calculatePersonBalancesFromRecords, verifyZeroSum } from "./balance";
import { generateSettlementSuggestions } from "./settlement";

describe("settlement", () => {
  it("matches largest debtors and creditors", () => expect(generateSettlementSuggestions([{ id: "a", balanceRial: 70n }, { id: "b", balanceRial: 30n }, { id: "c", balanceRial: -60n }, { id: "d", balanceRial: -40n }])).toEqual([{ fromId: "c", toId: "a", amountRial: 60n }, { fromId: "d", toId: "a", amountRial: 10n }, { fromId: "d", toId: "b", amountRial: 30n }]));
  it("full payment reaches zero", () => { const balances = calculatePersonBalancesFromRecords([{ id: "a", name: "علی", familyId: "1", paidExpenses: [{ amountRial: 100n }], expenseShares: [{ shareRial: 50n }], receivedPayments: [{ amountRial: 50n }] }, { id: "b", name: "سارا", familyId: "2", paidExpenses: [], expenseShares: [{ shareRial: 50n }], sentPayments: [{ amountRial: 50n }] }]); expect(balances.map((item) => item.balanceRial)).toEqual([0n, 0n]); expect(verifyZeroSum(balances)).toBe(true); });
  it("supports partial payments", () => { const balances = calculatePersonBalancesFromRecords([{ id: "a", name: "علی", familyId: "1", paidExpenses: [{ amountRial: 100n }], expenseShares: [{ shareRial: 50n }], receivedPayments: [{ amountRial: 20n }] }, { id: "b", name: "سارا", familyId: "2", paidExpenses: [], expenseShares: [{ shareRial: 50n }], sentPayments: [{ amountRial: 20n }] }]); expect(balances.map((item) => item.balanceRial)).toEqual([30n, -30n]); });
});
