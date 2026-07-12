"use client";

import { useState } from "react";
import { Field, fieldClass } from "./field";
import { MoneyInput } from "./money-input";
import { PersianDatePicker } from "./persian-date-picker";
import { SubmitButton } from "./submit-button";

type Day = { value: string; label: string; count: number; names: string[] };
type Person = { id: string; name: string };

export function ExpenseForm({ action, days, people, defaults }: { action: (formData: FormData) => Promise<void>; days: Day[]; people: Person[]; defaults?: { amount: string; unit: string; payerPersonId: string; expenseDate: string; category: string; description: string } }) {
  const [selectedDate, setSelectedDate] = useState(defaults?.expenseDate ?? days[0]?.value ?? "");
  const day = days.find((item) => item.value === selectedDate);

  return <form action={action} className="grid gap-4">
    <div className="grid gap-4 sm:grid-cols-2"><Field label="مبلغ"><MoneyInput required defaultValue={defaults?.amount} /></Field><Field label="واحد"><select name="unit" defaultValue={defaults?.unit ?? "TOMAN"} className={fieldClass}><option value="TOMAN">تومان</option><option value="MILLION_TOMAN">میلیون تومان</option><option value="RIAL">ریال</option></select></Field></div>
    <Field label="پرداخت‌کننده"><select name="payerPersonId" required defaultValue={defaults?.payerPersonId} className={fieldClass}>{people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></Field>
    <Field label="تاریخ"><PersianDatePicker name="expenseDate" label="تاریخ هزینه" defaultValue={selectedDate} min={days[0]?.value} max={days.at(-1)?.value} onValueChange={setSelectedDate} /></Field>
    <div className={`rounded-xl p-3 text-sm ${day?.count ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{day?.count ? <>این هزینه بین {day.count.toLocaleString("fa-IR")} نفر حاضر در این تاریخ تقسیم می‌شود.<details className="mt-1"><summary className="cursor-pointer font-bold">دیدن افراد</summary><p className="mt-1">{day.names.join("، ")}</p></details></> : "برای این تاریخ هیچ فرد حاضری ثبت نشده است. ابتدا خط زمانی را تکمیل کنید."}</div>
    <Field label="دسته‌بندی"><select name="category" defaultValue={defaults?.category ?? "OTHER"} className={fieldClass}><option value="FOOD">خوراک</option><option value="ACCOMMODATION">اقامت</option><option value="TRANSPORT">حمل‌ونقل</option><option value="SHOPPING">خرید</option><option value="ENTERTAINMENT">تفریح</option><option value="OTHER">سایر</option></select></Field>
    <Field label="توضیحات اختیاری"><input name="description" maxLength={200} defaultValue={defaults?.description} className={fieldClass} /></Field>
    <SubmitButton>{defaults ? "ذخیره هزینه" : "افزودن هزینه"}</SubmitButton>
  </form>;
}
