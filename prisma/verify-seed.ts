import { PrismaClient } from "@prisma/client";
import { calculatePersonBalancesFromRecords, verifyZeroSum } from "../src/services/balance";
const prisma = new PrismaClient();
async function main() {
  await prisma.trip.deleteMany({ where: { name: { startsWith: "سفر آزمایشی" } } });
  const trip = await prisma.trip.findFirstOrThrow({ where: { name: "سفر خانوادگی شمال" }, include: { persons: { include: { paidExpenses: true, expenseShares: true, sentPayments: true, receivedPayments: true } } } });
  const counts: number[] = [];
  for (let day = 3; day <= 10; day++) counts.push(await prisma.person.count({ where: { tripId: trip.id, attendancePeriods: { some: { startDate: { lte: new Date(Date.UTC(2026, 7, day)) }, endDate: { gte: new Date(Date.UTC(2026, 7, day)) } } } } }));
  if (counts.join(",") !== "6,6,6,10,10,8,8,8") throw new Error(`حضور نمونه نادرست است: ${counts.join(",")}`);
  const balances = calculatePersonBalancesFromRecords(trip.persons); verifyZeroSum(balances); if (balances.some((balance) => balance.balanceRial !== 0n)) throw new Error("سفر نمونه به مانده صفر نرسیده است.");
  console.log("نمونه تأیید شد: حضور ۶/۱۰/۸ نفر و مانده نهایی صفر.");
}
main().finally(() => prisma.$disconnect());
