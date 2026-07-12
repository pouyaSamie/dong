import { z } from "zod";

export const nameSchema = z.string().trim().min(1, "نام را وارد کنید.").max(80, "نام نباید بیشتر از ۸۰ نویسه باشد.");

export const tripSchema = z.object({
  name: nameSchema,
  startDate: z.coerce.date({ error: "تاریخ شروع معتبر نیست." }),
  endDate: z.coerce.date({ error: "تاریخ پایان معتبر نیست." }),
  displayUnit: z.enum(["RIAL", "TOMAN"]),
}).superRefine((trip, context) => {
  if (trip.endDate < trip.startDate) context.addIssue({ code: "custom", path: ["endDate"], message: "تاریخ پایان نمی‌تواند قبل از شروع باشد." });
  const duration = Math.floor((trip.endDate.getTime() - trip.startDate.getTime()) / 86_400_000) + 1;
  if (duration > 60) context.addIssue({ code: "custom", path: ["endDate"], message: "مدت سفر حداکثر ۶۰ روز است." });
});

export function firstZodError(error: z.ZodError) { return error.issues[0]?.message ?? "اطلاعات واردشده معتبر نیست."; }
