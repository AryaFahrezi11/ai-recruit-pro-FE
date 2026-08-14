import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import MaintenanceProvider from '@/components/MaintenanceProvider';

export async function generateMetadata(): Promise<Metadata> {
  try {
    // Next.js fetch API can be used directly on the server side
    const res = await fetch('http://127.0.0.1:8000/api/config/public', { next: { revalidate: 60 } });
    if (res.ok) {
      const config = await res.json();
      return {
        title: config.seo_title || "AI Recruit Pro",
        description: config.seo_description || "Platform Rekrutmen Cerdas Berbasis AI",
      };
    }
  } catch (error) {
    console.error("Failed to fetch SEO metadata", error);
  }
  
  return {
    title: "AI Recruit Pro",
    description: "Platform Rekrutmen Cerdas Berbasis AI",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MaintenanceProvider>
          {children}
        </MaintenanceProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
