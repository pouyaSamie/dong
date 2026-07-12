"use client";
export function DeleteButton({ action, label = "حذف", message = "از حذف این مورد مطمئن هستید؟" }: { action: () => Promise<void>; label?: string; message?: string }) {
  return <form action={action} onSubmit={(event) => { if (!confirm(message)) event.preventDefault(); }}><button className="min-h-11 rounded-xl px-3 text-sm font-bold text-rose-600 hover:bg-rose-50">{label}</button></form>;
}
