"use client";

import DatePicker, { DateObject, type DatePickerRef } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import gregorian from "react-date-object/calendars/gregorian";
import persianFa from "react-date-object/locales/persian_fa";
import gregorianEn from "react-date-object/locales/gregorian_en";
import { useRef, useState } from "react";
import { fieldClass } from "./field";

function toPersianDate(value?: string) {
  if (!value) return undefined;

  return new DateObject({ date: value, format: "YYYY-MM-DD", calendar: gregorian, locale: gregorianEn }).convert(persian, persianFa);
}

export function PersianDatePicker({ name, label, defaultValue, min, max, compact = false, onValueChange }: { name: string; label: string; defaultValue?: string; min?: string; max?: string; compact?: boolean; onValueChange?: (value: string) => void }) {
  const [selected, setSelected] = useState<DateObject | undefined>(toPersianDate(defaultValue));
  const pickerRef = useRef<DatePickerRef | null>(null);
  const isoValue = selected ? new DateObject(selected).convert(gregorian, gregorianEn).format("YYYY-MM-DD") : "";

  return <><input type="hidden" name={name} value={isoValue} readOnly /><DatePicker
    ref={pickerRef}
    calendar={persian}
    locale={persianFa}
    value={selected}
    onChange={(value) => {
      const next = value && !Array.isArray(value) ? value : undefined;
      setSelected(next);
      if (next) {
        onValueChange?.(new DateObject(next).convert(gregorian, gregorianEn).format("YYYY-MM-DD"));
        window.setTimeout(() => pickerRef.current?.closeCalendar(), 20);
      }
    }}
    minDate={toPersianDate(min)}
    maxDate={toPersianDate(max)}
    format="YYYY-MM-DD"
    calendarPosition="bottom-right"
    onOpenPickNewDate={false}
    title={label}
    placeholder="انتخاب تاریخ"
    inputClass={`${fieldClass} ${compact ? "min-h-9 w-36 py-1 text-xs" : ""}`}
    containerClassName="w-full"
    inputMode="none"
    editable={false}
  /></>;
}
