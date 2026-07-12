import { PrismaClient, ExpenseCategory } from "@prisma/client";
import { splitAmountEqually } from "../src/lib/money";
import { calculatePersonBalancesFromRecords } from "../src/services/balance";
import { generateSettlementSuggestions } from "../src/services/settlement";
const prisma = new PrismaClient();
const date = (day: number) => new Date(Date.UTC(2026, 7, day));

async function main() {
  await prisma.trip.deleteMany({ where: { name: "سفر خانوادگی شمال" } });
  const trip = await prisma.trip.create({ data: { name: "سفر خانوادگی شمال", startDate: date(3), endDate: date(10), displayUnit: "TOMAN" } });
  const definitions = [{ name: "خانواده علی", people: [["علی", 3, 10], ["سارا", 3, 10], ["آرین", 3, 10]] }, { name: "خانواده نوید", people: [["نوید", 3, 10], ["نازنین", 3, 7], ["رایان", 3, 7]] }, { name: "خانواده پویا", people: [["پویا", 6, 10], ["مریم", 6, 10]] }, { name: "خانواده رضا", people: [["رضا", 6, 10], ["مهسا", 6, 10]] }] as const;
  const people = new Map<string, string>();
  for (const definition of definitions) { const family = await prisma.family.create({ data: { tripId: trip.id, name: definition.name } }); for (const [name, start, end] of definition.people) { const person = await prisma.person.create({ data: { tripId: trip.id, familyId: family.id, name, attendancePeriods: { create: { tripId: trip.id, startDate: date(start), endDate: date(end) } } } }); people.set(name, person.id); } }
  const expenses = [{ payer: "علی", day: 3, amount: 12_000_000n, category: ExpenseCategory.TRANSPORT, description: "کرایه رفت" }, { payer: "پویا", day: 6, amount: 8_500_000n, category: ExpenseCategory.FOOD, description: "خرید مواد غذایی" }, { payer: "رضا", day: 9, amount: 15_000_000n, category: ExpenseCategory.ACCOMMODATION, description: "هزینه اقامت" }];
  for (const item of expenses) { const present = await prisma.person.findMany({ where: { tripId: trip.id, attendancePeriods: { some: { startDate: { lte: date(item.day) }, endDate: { gte: date(item.day) } } } } }); await prisma.expense.create({ data: { tripId: trip.id, payerPersonId: people.get(item.payer)!, expenseDate: date(item.day), amountRial: item.amount, category: item.category, description: item.description, shares: { create: splitAmountEqually(item.amount, present.map((person) => person.id)) } } }); }
  await prisma.payment.createMany({ data: [{ tripId: trip.id, fromPersonId: people.get("علی")!, toPersonId: people.get("سارا")!, paymentDate: date(10), amountRial: 2_000_000n, description: "پرداخت نمونه" }, { tripId: trip.id, fromPersonId: people.get("نوید")!, toPersonId: people.get("پویا")!, paymentDate: date(10), amountRial: 1_000_000n, description: "پرداخت نمونه" }] });
  const records = await prisma.person.findMany({ where: { tripId: trip.id }, include: { paidExpenses: true, expenseShares: true, sentPayments: true, receivedPayments: true } }); const balances = calculatePersonBalancesFromRecords(records); const suggestions = generateSettlementSuggestions(balances.map((balance) => ({ id: balance.personId, balanceRial: balance.balanceRial }))); await prisma.payment.createMany({ data: suggestions.map((suggestion) => ({ tripId: trip.id, fromPersonId: suggestion.fromId, toPersonId: suggestion.toId, paymentDate: date(10), amountRial: suggestion.amountRial, description: "تسویه نهایی نمونه" })) });
  console.log("سفر نمونه دنگ ساخته شد.");
}
main().finally(() => prisma.$disconnect());
