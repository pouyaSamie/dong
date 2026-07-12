import { prisma } from "@/lib/prisma";

export type PersonBalance = { personId: string; personName: string; familyId: string; paidRial: bigint; shareRial: bigint; paymentsReceivedRial: bigint; paymentsSentRial: bigint; balanceRial: bigint };
export type FamilyBalance = { familyId: string; familyName: string; paidRial: bigint; shareRial: bigint; balanceRial: bigint; members: PersonBalance[] };

export function calculatePersonBalancesFromRecords(people: { id: string; name: string; familyId: string; paidExpenses: { amountRial: bigint }[]; expenseShares: { shareRial: bigint }[]; sentPayments?: { amountRial: bigint }[]; receivedPayments?: { amountRial: bigint }[] }[]): PersonBalance[] {
  return people.map((person) => { const paidRial = person.paidExpenses.reduce((sum, item) => sum + item.amountRial, 0n); const shareRial = person.expenseShares.reduce((sum, item) => sum + item.shareRial, 0n); const paymentsReceivedRial = (person.receivedPayments ?? []).reduce((sum, item) => sum + item.amountRial, 0n); const paymentsSentRial = (person.sentPayments ?? []).reduce((sum, item) => sum + item.amountRial, 0n); return { personId: person.id, personName: person.name, familyId: person.familyId, paidRial, shareRial, paymentsReceivedRial, paymentsSentRial, balanceRial: paidRial - shareRial + paymentsSentRial - paymentsReceivedRial }; });
}

export function calculateFamilyBalancesFromRecords(families: { id: string; name: string }[], people: PersonBalance[]): FamilyBalance[] {
  return families.map((family) => { const members = people.filter((person) => person.familyId === family.id); return { familyId: family.id, familyName: family.name, members, paidRial: members.reduce((sum, member) => sum + member.paidRial, 0n), shareRial: members.reduce((sum, member) => sum + member.shareRial, 0n), balanceRial: members.reduce((sum, member) => sum + member.balanceRial, 0n) }; });
}

export function verifyZeroSum(balances: { balanceRial: bigint }[]) { const total = balances.reduce((sum, item) => sum + item.balanceRial, 0n); if (total !== 0n) throw new Error(`عدم توازن حساب‌ها: ${total}`); return true; }

export async function calculatePersonBalances(tripId: string) { const people = await prisma.person.findMany({ where: { tripId }, orderBy: { createdAt: "asc" }, include: { paidExpenses: { select: { amountRial: true } }, expenseShares: { select: { shareRial: true } }, sentPayments: { select: { amountRial: true } }, receivedPayments: { select: { amountRial: true } } } }); const balances = calculatePersonBalancesFromRecords(people); verifyZeroSum(balances); return balances; }

export async function calculateFamilyBalances(tripId: string) { const [families, people] = await Promise.all([prisma.family.findMany({ where: { tripId }, orderBy: { createdAt: "asc" } }), calculatePersonBalances(tripId)]); return calculateFamilyBalancesFromRecords(families, people); }
