import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hiqbah Coffee | محمصة حِقبة",
  description: "Internal production management system for Hiqbah Coffee Roasters",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Read language preference from the JWT — no extra DB query needed
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? await verifyToken(token) : null;
  const lang = user?.preferredLanguage ?? "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} className="h-full antialiased">
      <head>
        {/* The Arabic subset is needed by every screen before first paint. */}
        <link rel="preload" href="/fonts/cairo/cairo-arabic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
