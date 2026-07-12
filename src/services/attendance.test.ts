import { describe, expect, it } from "vitest";
import { isPresent, mergeAttendancePeriods, setAttendanceDate, toggleAttendanceDate, validateAttendancePeriod } from "./attendance";
const date = (day: number) => new Date(Date.UTC(2026, 7, day));
describe("attendance", () => {
  it("validates trip boundaries and order", () => { expect(() => validateAttendancePeriod({ startDate: date(3), endDate: date(5) }, { startDate: date(1), endDate: date(10) })).not.toThrow(); expect(() => validateAttendancePeriod({ startDate: date(5), endDate: date(3) }, { startDate: date(1), endDate: date(10) })).toThrow(); expect(() => validateAttendancePeriod({ startDate: date(0), endDate: date(2) }, { startDate: date(1), endDate: date(10) })).toThrow(); });
  it("merges overlapping and adjacent periods", () => expect(mergeAttendancePeriods([{ startDate: date(1), endDate: date(3) }, { startDate: date(3), endDate: date(5) }, { startDate: date(6), endDate: date(7) }])).toEqual([{ startDate: date(1), endDate: date(7) }]));
  it("supports late arrival, early departure and multiple periods", () => { const periods = [{ startDate: date(3), endDate: date(5) }, { startDate: date(8), endDate: date(9) }]; expect(isPresent(periods, date(2))).toBe(false); expect(isPresent(periods, date(4))).toBe(true); expect(isPresent(periods, date(8))).toBe(true); });
  it("toggles a day and splits a range", () => expect(toggleAttendanceDate([{ startDate: date(1), endDate: date(5) }], date(3))).toEqual([{ startDate: date(1), endDate: date(2) }, { startDate: date(4), endDate: date(5) }]));
  it("sets one family day without changing other dates", () => expect(setAttendanceDate([{ startDate: date(1), endDate: date(5) }], date(3), false)).toEqual([{ startDate: date(1), endDate: date(2) }, { startDate: date(4), endDate: date(5) }]));
});
