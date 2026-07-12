"use client";
export function ConfirmForm({ action, enabled, message, className, children }: { action: (formData: FormData) => void | Promise<void>; enabled: boolean; message: string; className?: string; children: React.ReactNode }) {
  return <form action={action} className={className} onSubmit={(event) => { if (enabled && !confirm(message)) event.preventDefault(); }}>{children}</form>;
}
