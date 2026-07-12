export type CurrencyDisplayUnit = "RIAL" | "TOMAN";
export type MoneyInputUnit = CurrencyDisplayUnit | "MILLION_TOMAN";

const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

export function normalizePersianDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const persianIndex = persianDigits.indexOf(digit);
    return String(persianIndex >= 0 ? persianIndex : arabicDigits.indexOf(digit));
  });
}

export function toPersianDigits(value: string | number | bigint): string {
  return String(value).replace(/\d/g, (digit) => persianDigits[Number(digit)]);
}

export function parsePersianMoneyInput(value: string): bigint {
  const normalized = normalizePersianDigits(value).replace(/[٬,\s]/g, "");
  if (!/^\d+$/.test(normalized)) throw new Error("مبلغ واردشده معتبر نیست.");
  return BigInt(normalized);
}

export function toRial(value: bigint, unit: CurrencyDisplayUnit): bigint {
  return unit === "TOMAN" ? value * 10n : value;
}

export function inputToRial(value: bigint, unit: MoneyInputUnit): bigint {
  if (unit === "MILLION_TOMAN") return value * 10_000_000n;
  return toRial(value, unit);
}

export function fromRial(value: bigint, unit: CurrencyDisplayUnit): bigint {
  return unit === "TOMAN" ? value / 10n : value;
}

export function formatMoney(valueRial: bigint, unit: CurrencyDisplayUnit): string {
  const value = fromRial(valueRial, unit);
  const formatted = new Intl.NumberFormat("fa-IR").format(value);
  return `${formatted} ${unit === "TOMAN" ? "تومان" : "ریال"}`;
}

export function splitAmountEqually(amountRial: bigint, participantIds: string[]) {
  if (amountRial <= 0n || participantIds.length === 0) throw new Error("مبلغ و تعداد افراد باید بیشتر از صفر باشد.");
  const stableIds = [...participantIds].sort();
  const count = BigInt(stableIds.length);
  const base = amountRial / count;
  const remainder = Number(amountRial % count);
  return stableIds.map((personId, index) => ({ personId, shareRial: base + (index < remainder ? 1n : 0n) }));
}
