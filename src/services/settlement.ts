export type SettlementSuggestion = { fromId: string; toId: string; amountRial: bigint };
export function generateSettlementSuggestions(balances: { id: string; balanceRial: bigint }[]): SettlementSuggestion[] {
  const debtors = balances.filter((item) => item.balanceRial < 0n).map((item) => ({ id: item.id, amount: -item.balanceRial })).sort((a, b) => a.amount === b.amount ? a.id.localeCompare(b.id) : a.amount > b.amount ? -1 : 1);
  const creditors = balances.filter((item) => item.balanceRial > 0n).map((item) => ({ id: item.id, amount: item.balanceRial })).sort((a, b) => a.amount === b.amount ? a.id.localeCompare(b.id) : a.amount > b.amount ? -1 : 1);
  const suggestions: SettlementSuggestion[] = []; let debtorIndex = 0; let creditorIndex = 0;
  while (debtorIndex < debtors.length && creditorIndex < creditors.length) { const debtor = debtors[debtorIndex]; const creditor = creditors[creditorIndex]; const amountRial = debtor.amount < creditor.amount ? debtor.amount : creditor.amount; suggestions.push({ fromId: debtor.id, toId: creditor.id, amountRial }); debtor.amount -= amountRial; creditor.amount -= amountRial; if (debtor.amount === 0n) debtorIndex++; if (creditor.amount === 0n) creditorIndex++; }
  return suggestions;
}
