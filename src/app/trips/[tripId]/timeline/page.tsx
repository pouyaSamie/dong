import Link from "next/link";
import { notFound } from "next/navigation";
import { createGroupWithMember, createPerson, deleteFamily, deletePerson, updateFamily, updatePerson, updateTrip } from "@/app/actions";
import { DeleteButton } from "@/components/delete-button";
import { ErrorBanner } from "@/components/error-banner";
import { Field, fieldClass } from "@/components/field";
import { PersianDatePicker } from "@/components/persian-date-picker";
import { SubmitButton } from "@/components/submit-button";
import { Timeline } from "@/components/timeline";
import { TripNav } from "@/components/trip-nav";
import { formatJalaliDate, toLocalDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export default async function TimelineSetupPage({ params, searchParams }: { params: Promise<{ tripId: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ tripId }, { error }] = await Promise.all([params, searchParams]);
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: { _count: { select: { expenses: true } }, families: { orderBy: { createdAt: "asc" }, include: { persons: { orderBy: { createdAt: "asc" }, include: { attendancePeriods: true } } } } } });
  if (!trip) notFound();

  return <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 pb-24 sm:px-6 lg:pb-8">
    <TripNav tripId={trip.id} active="timeline" />
    <header className="mb-8"><Link href="/trips" className="text-sm font-bold text-emerald-700">← همه سفرها</Link><h1 className="mt-3 text-3xl font-black tracking-tight">{trip.name}</h1><p className="mt-2 text-slate-500">{formatJalaliDate(trip.startDate)} تا {formatJalaliDate(trip.endDate)}</p></header>
    <ErrorBanner message={error} />

    <section className="grid items-start gap-6 xl:grid-cols-[20rem_1fr]">
      <aside className="grid gap-5 xl:sticky xl:top-6">
        <form action={createGroupWithMember.bind(null, trip.id)} className="rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white p-5 shadow-sm"><span className="text-sm font-bold text-emerald-700">شروع سریع</span><h2 className="mt-1 text-xl font-black">افزودن نفر یا خانواده</h2><p className="mt-2 text-sm leading-6 text-slate-600">برای یک نفر فقط نام او را بنویسید. نام خانواده فقط برای گروه‌های چندنفره لازم است.</p><div className="mt-5 grid gap-4"><Field label="نام شخص"><input name="personName" required autoComplete="name" className={fieldClass} placeholder="مثلاً سارا" /></Field><Field label="نام خانواده یا گروه (اختیاری)"><input name="groupName" className={fieldClass} placeholder="مثلاً خانواده احمدی" /></Field><SubmitButton className="w-full">افزودن</SubmitButton></div></form>
        <details className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><summary className="cursor-pointer font-black marker:text-emerald-600">تنظیمات سفر</summary><form action={updateTrip.bind(null, trip.id)} className="mt-5 grid gap-3"><Field label="نام سفر"><input name="name" defaultValue={trip.name} className={fieldClass} required /></Field><div className="grid grid-cols-2 gap-3"><Field label="شروع"><PersianDatePicker name="startDate" label="تاریخ شروع سفر" defaultValue={toLocalDate(trip.startDate)} /></Field><Field label="پایان"><PersianDatePicker name="endDate" label="تاریخ پایان سفر" defaultValue={toLocalDate(trip.endDate)} /></Field></div><Field label="واحد نمایش"><select name="displayUnit" defaultValue={trip.displayUnit} className={fieldClass}><option value="TOMAN">تومان</option><option value="RIAL">ریال</option></select></Field><SubmitButton>ذخیره تغییرات</SubmitButton></form></details>
      </aside>

      <section><div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-sm font-bold text-emerald-700">افراد سفر</p><h2 className="mt-1 text-2xl font-black">خانواده‌ها و اعضا</h2></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600">{trip.families.length.toLocaleString("fa-IR")} گروه · {trip.families.reduce((count, family) => count + family.persons.length, 0).toLocaleString("fa-IR")} نفر</span></div>
        {trip.families.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">نام اولین نفر را در فرم کنار صفحه وارد کنید.</div> : <div className="grid gap-4">{trip.families.map((family) => <article key={family.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h3 className="font-black">{family.name}</h3><p className="mt-1 text-sm text-slate-500">{family.persons.length.toLocaleString("fa-IR")} عضو</p></div><details className="relative"><summary className="cursor-pointer rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">مدیریت گروه</summary><div className="absolute left-0 z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"><form action={updateFamily.bind(null, trip.id, family.id)} className="grid gap-2"><input aria-label="نام گروه" name="name" defaultValue={family.name} required className={fieldClass} /><SubmitButton>ذخیره نام</SubmitButton></form><div className="mt-2 border-t border-slate-100 pt-2"><DeleteButton action={deleteFamily.bind(null, trip.id, family.id)} label="حذف گروه" message={family.persons.length ? "این گروه و همه اعضای آن حذف شوند؟" : "این گروه حذف شود؟"} /></div></div></details></header>
          <div className="divide-y divide-slate-100">{family.persons.map((person) => <div key={person.id} className="flex items-center justify-between gap-3 px-5 py-3"><strong className="min-w-0 truncate">{person.name}</strong><div className="flex items-center gap-1"><details className="relative"><summary className="cursor-pointer rounded-lg px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50">ویرایش</summary><div className="absolute left-0 z-20 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"><form action={updatePerson.bind(null, trip.id, person.id)} className="grid gap-3"><Field label="نام عضو"><input name="name" defaultValue={person.name} required className={fieldClass} /></Field><Field label="گروه"><select name="familyId" defaultValue={family.id} className={fieldClass}>{trip.families.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></Field><SubmitButton>ذخیره تغییرات</SubmitButton></form></div></details><DeleteButton action={deletePerson.bind(null, trip.id, person.id)} label="حذف" message={`عضو «${person.name}» حذف شود؟ اگر سابقه هزینه یا پرداخت دارد، ابتدا سوابق مالی او را حذف یا ویرایش کنید.`} /></div></div>)}</div>
          <form action={createPerson.bind(null, trip.id, family.id)} className="flex flex-col gap-2 bg-slate-50 px-5 py-4 sm:flex-row"><input name="name" required className={fieldClass} placeholder={`افزودن عضو به ${family.name}`} /><SubmitButton className="shrink-0">افزودن عضو</SubmitButton></form>
        </article>)}</div>}
      </section>
    </section>
    <Timeline tripId={trip.id} startDate={trip.startDate} endDate={trip.endDate} families={trip.families} hasExpenses={trip._count.expenses > 0} />
  </main>;
}
