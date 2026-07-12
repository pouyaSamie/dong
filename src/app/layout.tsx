import type { Metadata, Viewport } from "next";
import "@fontsource-variable/vazirmatn";
import "./globals.css";
import { ServiceWorker } from "@/components/service-worker";

export const metadata: Metadata = {
  title: { default: "DONG دنگ", template: "%s | دنگ" },
  description: "تقسیم ساده و دقیق هزینه‌های سفر برای خانواده و دوستان",
  applicationName: "دنگ",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "دنگ", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#059669", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className="h-full">
      <body className="min-h-full">{children}<ServiceWorker /></body>
    </html>
  );
}
