"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { firstZodError, nameSchema, tripSchema } from "@/lib/validation";
import { parseLocalDate } from "@/lib/date";
import { isPresent, mergeAttendancePeriods, replaceAttendance, setAttendanceDate, toggleAttendanceDate, validateAttendancePeriod } from "@/services/attendance";
import { createExpense as createExpenseRecord, recalculateExpenseShares, updateExpense as updateExpenseRecord } from "@/services/expense";
import { inputToRial, type MoneyInputUnit, parsePersianMoneyInput } from "@/lib/money";
import { ExpenseCategory } from "@prisma/client";

const value = (formData: FormData, key: string) => String(formData.get(key) ?? "");
const fail = (path: string, message: string): never => redirect(`${path}?error=${encodeURIComponent(message)}`);

export async function createTrip(formData: FormData) {
  const result = tripSchema.safeParse({ name: value(formData, "name"), startDate: value(formData, "startDate"), endDate: value(formData, "endDate"), displayUnit: value(formData, "displayUnit") });
  if (!result.success) fail("/trips", firstZodError(result.error));
  const trip = await prisma.trip.create({ data: result.data! });
  redirect(`/trips/${trip.id}/timeline`);
}

export async function updateTrip(tripId: string, formData: FormData) {
  const result = tripSchema.safeParse({ name: value(formData, "name"), startDate: value(formData, "startDate"), endDate: value(formData, "endDate"), displayUnit: value(formData, "displayUnit") });
  if (!result.success) fail(`/trips/${tripId}/timeline`, firstZodError(result.error));
  const tripData = result.data!;
  const current = await prisma.trip.findUnique({ where: { id: tripId }, include: { persons: true } });
  if (!current) fail("/trips", "سفر پیدا نشد.");
  const personIds = current!.persons.map((person) => person.id);
  await prisma.$transaction([
    prisma.trip.update({ where: { id: tripId }, data: tripData }),
    prisma.attendancePeriod.updateMany({ where: { personId: { in: personIds }, startDate: { lt: tripData.startDate } }, data: { startDate: tripData.startDate } }),
    prisma.attendancePeriod.updateMany({ where: { personId: { in: personIds }, endDate: { gt: tripData.endDate } }, data: { endDate: tripData.endDate } }),
  ]);
  revalidatePath(`/trips/${tripId}/timeline`);
}

export async function deleteTrip(tripId: string) { await prisma.trip.delete({ where: { id: tripId } }); revalidatePath("/trips"); }

export async function createFamily(tripId: string, formData: FormData) {
  const result = nameSchema.safeParse(value(formData, "name"));
  if (!result.success) fail(`/trips/${tripId}/timeline`, firstZodError(result.error));
  await prisma.family.create({ data: { tripId, name: result.data! } }); revalidatePath(`/trips/${tripId}/timeline`);
}

export async function createGroupWithMember(tripId: string, formData: FormData) {
  const personResult = nameSchema.safeParse(value(formData, "personName"));
  const requestedGroupName = value(formData, "groupName").trim();
  const groupResult = requestedGroupName ? nameSchema.safeParse(requestedGroupName) : personResult;
  if (!personResult.success) fail(`/trips/${tripId}/timeline`, firstZodError(personResult.error));
  if (!groupResult.success) fail(`/trips/${tripId}/timeline`, firstZodError(groupResult.error));

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) fail("/trips", "سفر پیدا نشد.");
  const personName = personResult.data!;
  const groupName = requestedGroupName || personName;
  await prisma.$transaction(async (transaction) => {
    const family = await transaction.family.create({ data: { tripId, name: groupName } });
    await transaction.person.create({ data: { tripId, familyId: family.id, name: personName, attendancePeriods: { create: { tripId, startDate: trip!.startDate, endDate: trip!.endDate } } } });
  });
  revalidatePath(`/trips/${tripId}/timeline`);
}

export async function updateFamily(tripId: string, familyId: string, formData: FormData) {
  const result = nameSchema.safeParse(value(formData, "name"));
  if (!result.success) fail(`/trips/${tripId}/timeline`, firstZodError(result.error));
  await prisma.family.update({ where: { id: familyId }, data: { name: result.data! } }); revalidatePath(`/trips/${tripId}/timeline`);
}

export async function deleteFamily(tripId: string, familyId: string) { await prisma.family.delete({ where: { id: familyId } }); revalidatePath(`/trips/${tripId}/timeline`); }

export async function createPerson(tripId: string, familyId: string, formData: FormData) {
  const result = nameSchema.safeParse(value(formData, "name"));
  if (!result.success) fail(`/trips/${tripId}/timeline`, firstZodError(result.error));
  const [trip, family] = await Promise.all([prisma.trip.findUnique({ where: { id: tripId } }), prisma.family.findFirst({ where: { id: familyId, tripId } })]);
  if (!trip || !family) fail(`/trips/${tripId}/timeline`, "سفر یا خانواده پیدا نشد.");
  await prisma.person.create({ data: { tripId, familyId, name: result.data!, attendancePeriods: { create: { tripId, startDate: trip!.startDate, endDate: trip!.endDate } } } });
  revalidatePath(`/trips/${tripId}/timeline`);
}

export async function updatePerson(tripId: string, personId: string, formData: FormData) {
  const result = nameSchema.safeParse(value(formData, "name"));
  const familyId = value(formData, "familyId");
  if (!result.success) fail(`/trips/${tripId}/timeline`, firstZodError(result.error));
  const family = await prisma.family.findFirst({ where: { id: familyId, tripId } });
  if (!family) fail(`/trips/${tripId}/timeline`, "خانواده مقصد پیدا نشد.");
  await prisma.person.update({ where: { id: personId }, data: { name: result.data!, familyId } }); revalidatePath(`/trips/${tripId}/timeline`);
}

export async function deletePerson(tripId: string, personId: string) { await prisma.person.delete({ where: { id: personId } }); revalidatePath(`/trips/${tripId}/timeline`); }

export async function toggleAttendanceDay(tripId: string, personId: string, dateValue: string) {
  const [trip, person] = await Promise.all([prisma.trip.findUnique({ where: { id: tripId } }), prisma.person.findFirst({ where: { id: personId, tripId }, include: { attendancePeriods: true } })]);
  if (!trip || !person) fail(`/trips/${tripId}/timeline`, "عضو یا سفر پیدا نشد.");
  const date = parseLocalDate(dateValue);
  try { validateAttendancePeriod({ startDate: date, endDate: date }, { startDate: trip!.startDate, endDate: trip!.endDate }); } catch (error) { fail(`/trips/${tripId}/timeline`, error instanceof Error ? error.message : "تاریخ حضور معتبر نیست."); }
  await replaceAttendance(personId, tripId, toggleAttendanceDate(person!.attendancePeriods, date));
  await recalculateExpenseShares(tripId);
  revalidatePath(`/trips/${tripId}/timeline`);
}

export async function toggleFamilyAttendanceDay(tripId: string, familyId: string, dateValue: string) {
  const [trip, family] = await Promise.all([prisma.trip.findUnique({ where: { id: tripId } }), prisma.family.findFirst({ where: { id: familyId, tripId }, include: { persons: { include: { attendancePeriods: true } } } })]);
  if (!trip || !family) fail(`/trips/${tripId}/timeline`, "خانواده یا سفر پیدا نشد.");
  const date = parseLocalDate(dateValue);
  try { validateAttendancePeriod({ startDate: date, endDate: date }, { startDate: trip!.startDate, endDate: trip!.endDate }); } catch (error) { fail(`/trips/${tripId}/timeline`, error instanceof Error ? error.message : "تاریخ حضور معتبر نیست."); }
  const shouldBePresent = family!.persons.some((person) => !isPresent(person.attendancePeriods, date));
  await prisma.$transaction(async (transaction) => {
    for (const person of family!.persons) {
      const periods = setAttendanceDate(person.attendancePeriods, date, shouldBePresent);
      await transaction.attendancePeriod.deleteMany({ where: { personId: person.id } });
      if (periods.length) await transaction.attendancePeriod.createMany({ data: periods.map((period) => ({ tripId, personId: person.id, ...period })) });
    }
  });
  await recalculateExpenseShares(tripId);
  revalidatePath(`/trips/${tripId}/timeline`);
}

export async function setAttendanceRange(tripId: string, personId: string, formData: FormData) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) fail("/trips", "سفر پیدا نشد.");
  const mode = value(formData, "mode");
  let periods: { startDate: Date; endDate: Date }[] = [];
  if (mode === "full") periods = [{ startDate: trip!.startDate, endDate: trip!.endDate }];
  if (mode === "range") periods = [{ startDate: parseLocalDate(value(formData, "startDate")), endDate: parseLocalDate(value(formData, "endDate")) }];
  try { periods.forEach((period) => validateAttendancePeriod(period, trip!)); } catch (error) { fail(`/trips/${tripId}/timeline`, error instanceof Error ? error.message : "بازه حضور معتبر نیست."); }
  await replaceAttendance(personId, tripId, mergeAttendancePeriods(periods)); revalidatePath(`/trips/${tripId}/timeline`);
  await recalculateExpenseShares(tripId);
}

export async function applyFamilyAttendanceRange(tripId: string, familyId: string, formData: FormData) {
  const [trip, family] = await Promise.all([prisma.trip.findUnique({ where: { id: tripId } }), prisma.family.findFirst({ where: { id: familyId, tripId }, include: { persons: true } })]);
  if (!trip || !family) fail(`/trips/${tripId}/timeline`, "خانواده یا سفر پیدا نشد.");
  const range = { startDate: parseLocalDate(value(formData, "startDate")), endDate: parseLocalDate(value(formData, "endDate")) };
  try { validateAttendancePeriod(range, trip!); } catch (error) { fail(`/trips/${tripId}/timeline`, error instanceof Error ? error.message : "بازه حضور معتبر نیست."); }
  await prisma.$transaction(async (transaction) => { const ids = family!.persons.map((person) => person.id); await transaction.attendancePeriod.deleteMany({ where: { personId: { in: ids } } }); if (ids.length) await transaction.attendancePeriod.createMany({ data: ids.map((personId) => ({ tripId, personId, ...range })) }); });
  await recalculateExpenseShares(tripId);
  revalidatePath(`/trips/${tripId}/timeline`);
}

function parseExpenseForm(tripId: string, formData: FormData) {
  const amount = parsePersianMoneyInput(value(formData, "amount"));
  const unitValue = value(formData, "unit");
  const unit: MoneyInputUnit = unitValue === "RIAL" || unitValue === "MILLION_TOMAN" ? unitValue : "TOMAN";
  const categoryValue = value(formData, "category") as ExpenseCategory;
  if (!Object.values(ExpenseCategory).includes(categoryValue)) throw new Error("دسته‌بندی معتبر نیست.");
  const description = value(formData, "description").trim().slice(0, 200) || undefined;
  return { tripId, payerPersonId: value(formData, "payerPersonId"), expenseDate: parseLocalDate(value(formData, "expenseDate")), amountRial: inputToRial(amount, unit), category: categoryValue, description };
}

export async function createExpense(tripId: string, formData: FormData) {
  try { await createExpenseRecord(parseExpenseForm(tripId, formData)); } catch (error) { fail(`/trips/${tripId}/expenses`, error instanceof Error ? error.message : "ثبت هزینه انجام نشد."); }
  revalidatePath(`/trips/${tripId}/expenses`);
}

export async function updateExpense(tripId: string, expenseId: string, formData: FormData) {
  try { await updateExpenseRecord(expenseId, parseExpenseForm(tripId, formData)); } catch (error) { fail(`/trips/${tripId}/expenses`, error instanceof Error ? error.message : "ویرایش هزینه انجام نشد."); }
  revalidatePath(`/trips/${tripId}/expenses`);
}

export async function deleteExpense(tripId: string, expenseId: string) { await prisma.expense.delete({ where: { id: expenseId } }); revalidatePath(`/trips/${tripId}/expenses`); }

export async function createPayment(tripId: string, formData: FormData) {
  try { const fromPersonId = value(formData, "fromPersonId"); const toPersonId = value(formData, "toPersonId"); if (!fromPersonId || !toPersonId || fromPersonId === toPersonId) throw new Error("پرداخت‌کننده و دریافت‌کننده باید متفاوت باشند."); const amount = parsePersianMoneyInput(value(formData, "amount")); const unitValue = value(formData, "unit"); const unit: MoneyInputUnit = unitValue === "RIAL" || unitValue === "MILLION_TOMAN" ? unitValue : "TOMAN"; const amountRial = inputToRial(amount, unit); if (amountRial <= 0n) throw new Error("مبلغ پرداخت باید بیشتر از صفر باشد."); const people = await prisma.person.count({ where: { tripId, id: { in: [fromPersonId, toPersonId] } } }); if (people !== 2) throw new Error("افراد انتخاب‌شده در این سفر نیستند."); await prisma.payment.create({ data: { tripId, fromPersonId, toPersonId, amountRial, paymentDate: parseLocalDate(value(formData, "paymentDate")), description: value(formData, "description").trim().slice(0, 200) || undefined } }); } catch (error) { fail(`/trips/${tripId}/settlement?view=suggestions`, error instanceof Error ? error.message : "ثبت پرداخت انجام نشد."); } revalidatePath(`/trips/${tripId}/settlement`);
}

export async function deletePayment(tripId: string, paymentId: string) { await prisma.payment.delete({ where: { id: paymentId } }); revalidatePath(`/trips/${tripId}/settlement`); }
