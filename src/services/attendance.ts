import { prisma } from "@/lib/prisma";
import { enumerateDates, parseLocalDate, toLocalDate } from "@/lib/date";

export type DateRange = { startDate: Date; endDate: Date };

export function validateAttendancePeriod(range: DateRange, trip: DateRange) {
  if (range.endDate < range.startDate) throw new Error("تاریخ پایان حضور نمی‌تواند قبل از شروع باشد.");
  if (range.startDate < trip.startDate || range.endDate > trip.endDate) throw new Error("بازه حضور باید داخل تاریخ سفر باشد.");
}

export function mergeAttendancePeriods(periods: DateRange[]): DateRange[] {
  const sorted = periods.map((period) => ({ ...period })).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const merged: DateRange[] = [];
  for (const period of sorted) {
    const previous = merged.at(-1);
    if (previous && period.startDate.getTime() <= previous.endDate.getTime() + 86_400_000) {
      if (period.endDate > previous.endDate) previous.endDate = period.endDate;
    } else merged.push(period);
  }
  return merged;
}

export function toggleAttendanceDate(periods: DateRange[], date: Date): DateRange[] {
  return setAttendanceDate(periods, date, !isPresent(periods, date));
}

export function setAttendanceDate(periods: DateRange[], date: Date, present: boolean): DateRange[] {
  const days = new Set(periods.flatMap((period) => enumerateDates(period.startDate, period.endDate).map(toLocalDate)));
  const key = toLocalDate(date);
  if (present) days.add(key); else days.delete(key);
  return mergeAttendancePeriods([...days].map((day) => { const parsed = parseLocalDate(day); return { startDate: parsed, endDate: parsed }; }));
}

export function isPresent(periods: DateRange[], date: Date) { return periods.some((period) => period.startDate <= date && period.endDate >= date); }

export async function getPresentPeople(tripId: string, date: Date) {
  return prisma.person.findMany({ where: { tripId, attendancePeriods: { some: { startDate: { lte: date }, endDate: { gte: date } } } }, orderBy: { createdAt: "asc" } });
}

export async function replaceAttendance(personId: string, tripId: string, periods: DateRange[]) {
  await prisma.$transaction(async (transaction) => {
    await transaction.attendancePeriod.deleteMany({ where: { personId } });
    if (periods.length) await transaction.attendancePeriod.createMany({ data: periods.map((period) => ({ personId, tripId, ...period })) });
  });
}
