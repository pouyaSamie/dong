import Link from "next/link";
import { formatJalaliDate } from "@/lib/date";
import { formatMoney } from "@/lib/money";

export default function Home() {
  const sampleDate = new Date(2026, 7, 3);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-5 py-12">
      <section className="rounded-[2rem] border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-950/5 sm:p-12">
        <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
          دُنگ، ساده و دقیق
        </span>
        <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
          DONG <span className="text-emerald-600">دنگ</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          هزینه‌های سفر را بین خانواده و دوستان، بر اساس روزهای حضور هر نفر تقسیم کنید.
        </p>
        <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <span className="block text-slate-500">نمونه تاریخ شمسی</span>
            <strong className="mt-1 block text-slate-900">{formatJalaliDate(sampleDate)}</strong>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <span className="block text-slate-500">نمونه مبلغ</span>
            <strong className="mt-1 block text-slate-900">{formatMoney(2_500_000n, "TOMAN")}</strong>
          </div>
        </div>
        <Link className="mt-8 inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-600 px-6 font-bold text-white transition hover:bg-emerald-700" href="/trips">
          شروع مدیریت سفرها
        </Link>
      </section>
    </main>
  );
}
