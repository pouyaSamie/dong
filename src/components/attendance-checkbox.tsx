"use client";

import { useEffect, useRef } from "react";

export function AttendanceCheckbox({ action, checked, indeterminate = false, confirmMessage, label }: { action: (formData: FormData) => void | Promise<void>; checked: boolean; indeterminate?: boolean; confirmMessage?: string; label: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (inputRef.current) inputRef.current.indeterminate = indeterminate; }, [indeterminate]);

  return <form ref={formRef} action={action} className="m-1 flex h-11 w-12 shrink-0 items-center justify-center"><label className="block h-11 w-12 cursor-pointer"><input ref={inputRef} type="checkbox" checked={checked} aria-label={label} title={label} onChange={() => { if (confirmMessage && !confirm(confirmMessage)) return; formRef.current?.requestSubmit(); }} className="peer sr-only" /><span aria-hidden className="flex h-11 w-12 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-lg font-black text-slate-400 transition peer-checked:border-emerald-600 peer-checked:bg-emerald-500 peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-emerald-400 peer-focus-visible:outline-offset-2">{indeterminate ? "—" : checked ? "✓" : "−"}</span></label></form>;
}
