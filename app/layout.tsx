import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import MaintenanceProvider from '@/components/MaintenanceProvider';
import { getBaseUrl } from '@/lib/api';

const siteUrl = "https://www.airecruit-pro.com";

export async function generateMetadata(): Promise<Metadata> {
  let title = "AI Recruit Pro - Platform Rekrutmen Cerdas Berbasis AI";
  let description = "AI Recruit Pro adalah platform rekrutmen berbasis AI terdepan di Indonesia untuk mempercepat pencocokan kandidat, screening CV otomatis, dan seleksi talenta terbaik.";

  try {
    // Next.js fetch API can be used directly on the server side
    const res = await fetch(`${getBaseUrl()}/config/public`, { next: { revalidate: 60 } });
    if (res.ok) {
      const config = await res.json();
      if (config.seo_title) title = config.seo_title;
      if (config.seo_description) description = config.seo_description;
    }
  } catch (error) {
    console.error("Failed to fetch SEO metadata", error);
  }

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: "%s | AI Recruit Pro",
    },
    description: description,
    keywords: [
      "AI Recruit Pro",
      "airecruitpro",
      "airecruit-pro",
      "ai recruit pro indonesia",
      "platform rekrutmen AI",
      "rekrutmen cerdas",
      "applicant tracking system AI",
      "screening CV otomatis",
      "lowongan kerja AI",
      "software rekrutmen perusahaan"
    ],
    authors: [{ name: "AI Recruit Pro Team", url: siteUrl }],
    creator: "AI Recruit Pro",
    publisher: "AI Recruit Pro",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: title,
      description: description,
      url: siteUrl,
      siteName: "AI Recruit Pro",
      images: [
        {
          url: `${siteUrl}/logo_hd.png`,
          width: 1200,
          height: 630,
          alt: "AI Recruit Pro Logo",
        },
      ],
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [`${siteUrl}/logo_hd.png`],
      creator: "@airecruitpro",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "Q9U_ioI63DeHw7bSPhF2FOPEjXf-KuAufpUFXkaNad0",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "AI Recruit Pro",
        "alternateName": ["airecruitpro", "airecruit-pro", "AI Recruit Pro Indonesia"],
        "url": siteUrl,
        "logo": `${siteUrl}/logo_hd.png`,
        "description": "Platform rekrutmen cerdas berbasis AI untuk efisiensi seleksi talenta dan screening CV otomatis."
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": "AI Recruit Pro",
        "alternateName": "airecruitpro",
        "publisher": {
          "@id": `${siteUrl}/#organization`
        },
        "inLanguage": "id-ID"
      }
    ]
  };

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="google-site-verification" content="Q9U_ioI63DeHw7bSPhF2FOPEjXf-KuAufpUFXkaNad0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <MaintenanceProvider>
          {children}
        </MaintenanceProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

