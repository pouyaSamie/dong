"use client";
import { useFormStatus } from "react-dom";
export function SubmitButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className={`min-h-11 rounded-xl bg-emerald-600 px-4 font-bold text-white disabled:opacity-60 ${className}`}>{pending ? "کمی صبر کنید…" : children}</button>;
}
