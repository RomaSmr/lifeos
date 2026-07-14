// apps/web/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LifeOS — Твоя жизнь. Твоя система.",
  description: "Операционная система для развития человека. Управляй задачами, привычками, целями и временем в единой экосистеме.",
  keywords: "lifeos, продуктивность, привычки, задачи, цели, фокус, заметки, планирование, саморазвитие",
  openGraph: {
    title: "LifeOS — Твоя жизнь. Твоя система.",
    description: "Операционная система для развития человека",
    url: "https://lifeos.vercel.app",
    siteName: "LifeOS",
    images: [
      {
        url: "https://lifeos.vercel.app/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeOS — Твоя жизнь. Твоя система.",
    description: "Операционная система для развития человека",
    images: ["https://lifeos.vercel.app/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}