import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/shared/providers/QueryProvider";
import { LocaleProvider } from "@/shared/providers/LocaleProvider";
import { LocaleSync } from "@/shared/components/LocaleSync";
import { Toaster } from "@/shared/components/ui/sonner";
import { RTLScript } from "@/shared/components/RTLScript";

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
      <LocaleSync />
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
      <head>
        <RTLScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootLayoutContent>{children}</RootLayoutContent>
        <Toaster />
      </body>
    </html>
  );
}
