export const fieldClass = "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-900 shadow-sm focus:border-emerald-500";
export function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2 text-sm font-bold text-slate-700"><span>{label}</span>{children}</label>; }
