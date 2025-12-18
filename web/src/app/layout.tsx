
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReportIssueButton } from "@/components/report-issue-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agendador Andreia",
  description: "Gestão inteligente para profissionais de beleza",
  manifest: "/manifest.json",
  themeColor: "#e11d48",
  viewport: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-512.png",
  }
};

export const viewport: Viewport = {
  themeColor: "#e11d48", // Rose-600
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        {children}
        <ReportIssueButton />
      </body>
    </html>
  );
}
