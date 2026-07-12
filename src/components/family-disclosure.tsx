"use client";

import { useState } from "react";

export function FamilyDisclosure({ name, memberCount, headerDays, children }: { name: string; memberCount: number; headerDays: React.ReactNode; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return <div className="border-b border-emerald-100 last:border-0"><div className="flex bg-emerald-50/70"><div className="sticky right-0 z-10 flex w-40 shrink-0 items-center border-l border-emerald-100 bg-emerald-50 px-3 py-2"><button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="flex w-full items-center justify-between rounded-xl px-1 text-right hover:bg-emerald-100"><span><strong className="block text-sm">{name}</strong><span className="text-xs text-emerald-700">{memberCount.toLocaleString("fa-IR")} عضو</span></span><span className="text-emerald-700">{expanded ? "⌃" : "⌄"}</span></button></div>{headerDays}</div>{expanded ? children : null}</div>;
}
