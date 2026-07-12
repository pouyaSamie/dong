"use client";

import { useState } from "react";
import { normalizePersianDigits, toPersianDigits } from "@/lib/money";
import { fieldClass } from "./field";

function formatInput(value: string) {
  const digits = normalizePersianDigits(value).replace(/[٬,\s]/g, "");
  if (!digits) return "";
  if (!/^\d+$/.test(digits)) return value;
  return new Intl.NumberFormat("fa-IR").format(BigInt(digits));
}

export function MoneyInput({ defaultValue = "", placeholder = "۲۵۰٬۰۰۰", required = false }: { defaultValue?: string; placeholder?: string; required?: boolean }) {
  const [amount, setAmount] = useState(formatInput(defaultValue));
  return <input name="amount" inputMode="numeric" required={required} value={amount} onChange={(event) => setAmount(formatInput(event.target.value))} className={fieldClass} placeholder={toPersianDigits(placeholder)} aria-label="مبلغ" />;
}
