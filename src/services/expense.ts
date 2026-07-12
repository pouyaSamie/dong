import type { ExpenseCategory, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { splitAmountEqually } from "@/lib/money";
import { getPresentPeople } from "./attendance";

export type ExpenseInput = { tripId: string; payerPersonId: string; expenseDate: Date; amountRial: bigint; category: ExpenseCategory; description?: string };

async function sharesFor(input: Pick<ExpenseInput, "tripId" | "expenseDate" | "amountRial">) {
  const people = await getPresentPeople(input.tripId, input.expenseDate);
  if (!people.length) throw new Error("برای این تاریخ هیچ فرد حاضری ثبت نشده است. ابتدا خط زمانی را تکمیل کنید.");
  return splitAmountEqually(input.amountRial, people.map((person) => person.id));
}

export async function createExpense(input: ExpenseInput) {
  const shares = await sharesFor(input);
  return prisma.$transaction((transaction) => transaction.expense.create({ data: { ...input, shares: { create: shares } }, include: { shares: true } }));
}

export async function updateExpense(expenseId: string, input: ExpenseInput) {
  const shares = await sharesFor(input);
  return prisma.$transaction(async (transaction) => { await transaction.expenseShare.deleteMany({ where: { expenseId } }); return transaction.expense.update({ where: { id: expenseId }, data: { ...input, shares: { create: shares } }, include: { shares: true } }); });
}

export async function recalculateExpenseShares(tripId: string, transaction?: Prisma.TransactionClient) {
  const database = transaction ?? prisma;
  const expenses = await database.expense.findMany({ where: { tripId } });
  for (const expense of expenses) {
    const people = await database.person.findMany({ where: { tripId, attendancePeriods: { some: { startDate: { lte: expense.expenseDate }, endDate: { gte: expense.expenseDate } } } }, orderBy: { id: "asc" } });
    if (!people.length) continue;
    const shares = splitAmountEqually(expense.amountRial, people.map((person) => person.id));
    await database.expenseShare.deleteMany({ where: { expenseId: expense.id } });
    await database.expenseShare.createMany({ data: shares.map((share) => ({ expenseId: expense.id, ...share })) });
  }
}
