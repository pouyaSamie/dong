import Link from "next/link";
import { createTrip, deleteTrip } from "@/app/actions";
import { DeleteButton } from "@/components/delete-button";
import { ErrorBanner } from "@/components/error-banner";
import { Field, fieldClass } from "@/components/field";
import { SubmitButton } from "@/components/submit-button";
import { formatJalaliDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { PersianDatePicker } from "@/components/persian-date-picker";

export default async function TripsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, trips] = await Promise.all([searchParams, prisma.trip.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { families: true, persons: true } } } })]);
  return <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6">
    <header className="mb-8"><Link href="/" className="text-sm font-bold text-emerald-700">DONG دنگ</Link><h1 className="mt-2 text-3xl font-black">سفرهای من</h1><p className="mt-2 text-slate-500">یک سفر بسازید و اعضای آن را اضافه کنید.</p></header>
    <ErrorBanner message={error} />
    <section className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
      <form action={createTrip} className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-5 text-xl font-black">ساخت سفر تازه</h2><div className="grid gap-4">
        <Field label="نام سفر"><input name="name" required maxLength={80} className={fieldClass} placeholder="مثلاً سفر شمال" /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="تاریخ شروع"><PersianDatePicker name="startDate" label="تاریخ شروع" /></Field><Field label="تاریخ پایان"><PersianDatePicker name="endDate" label="تاریخ پایان" /></Field></div>
        <Field label="واحد نمایش"><select name="displayUnit" defaultValue="TOMAN" className={fieldClass}><option value="TOMAN">تومان</option><option value="RIAL">ریال</option></select></Field><SubmitButton>ساخت سفر</SubmitButton>
      </div></form>
      <section><h2 className="mb-4 text-xl font-black">سفرها</h2>{trips.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">هنوز سفری نساخته‌اید.</div> : <div className="grid gap-4">{trips.map((trip) => <article key={trip.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><Link href={`/trips/${trip.id}/timeline`} className="block"><h3 className="text-xl font-black">{trip.name}</h3><p className="mt-2 text-sm text-slate-500">{formatJalaliDate(trip.startDate)} تا {formatJalaliDate(trip.endDate)}</p><p className="mt-3 text-sm">{trip._count.families.toLocaleString("fa-IR")} خانواده · {trip._count.persons.toLocaleString("fa-IR")} نفر</p></Link><div className="mt-2 flex justify-end"><DeleteButton action={deleteTrip.bind(null, trip.id)} message={`سفر «${trip.name}» و همه اطلاعات آن حذف شود؟`} /></div></article>)}</div>}</section>
    </section>
  </main>;
}
