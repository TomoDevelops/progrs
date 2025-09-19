import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { LocaleProvider } from "@/shared/providers/LocaleProvider";

import { Toaster } from "@/shared/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Progrs",
  description: "Training tracker app to track your daily workout.",
};

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <QueryProvider>{children}</QueryProvider>
    </LocaleProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootLayoutContent>{children}</RootLayoutContent>
        <Toaster />
      </body>
    </html>
  );
}
