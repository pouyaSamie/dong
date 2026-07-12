import { toJalaali } from "jalaali-js";
import { toPersianDigits } from "./money";

const months = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const weekdays = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

export function toLocalDate(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) throw new Error("تاریخ واردشده معتبر نیست.");
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatJalaliDate(date: Date): string {
  const { jy, jm, jd } = toJalaali(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  return `${toPersianDigits(jd)} ${months[jm - 1]} ${toPersianDigits(jy)}`;
}

export function formatPersianWeekday(date: Date): string {
  return weekdays[date.getUTCDay()];
}

export function enumerateDates(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) { dates.push(new Date(cursor)); cursor.setUTCDate(cursor.getUTCDate() + 1); }
  return dates;
}
