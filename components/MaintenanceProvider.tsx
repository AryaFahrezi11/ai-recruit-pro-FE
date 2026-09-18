'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store/useAppStore';
import { usePathname } from 'next/navigation';
import { getApiUrl } from '@/lib/api';

export default function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAppStore((state) => state.user);
  const pathname = usePathname();

  const checkMaintenance = async () => {
    try {
      const res = await fetch(getApiUrl('/config/public'), { cache: 'no-store' }).catch(() => null);
      if (res && res.ok) {
        const config = await res.json().catch(() => null);
        if (config && config.maintenance_mode === true) {
          setIsMaintenance(true);
        } else {
          setIsMaintenance(false);
        }
      }
    } catch {
      // Silently handle
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkMaintenance();
  }, [pathname]);

  if (isLoading) {
    return null;
  }

  const isAdmin = user?.role === 'admin';

  if (isMaintenance && !isAdmin) {
    // Biarkan akses ke login admin
    if (pathname === '/admin/login') {
      return <>{children}</>;
    }

    return (
      <div className="fixed inset-0 z-[9999] min-h-screen w-screen bg-[#0A1120] text-slate-100 flex flex-col justify-between font-sans antialiased overflow-hidden selection:bg-[#1A4B9F] selection:text-white">
        
        {/* Background Layer: Blended Landing Page Colors & Glowing Accent Lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          
          {/* Landing Page Gelembung (Top Right) */}
          <div className="absolute -top-[15%] -right-[5%] w-[60%] h-[85%] bg-[#1A4B9F]/20 rounded-[120px] rotate-[25deg] blur-2xl"></div>

          {/* Landing Page Gelembung (Bottom Left Solid Blue) */}
          <div className="absolute -bottom-[20%] -left-[10%] w-[45%] max-w-[550px] aspect-square bg-[#3886F6]/25 rounded-full blur-3xl"></div>

          {/* Deep Ambient Center Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#1A4B9F]/15 rounded-full blur-[140px]"></div>

          {/* Grid Lines Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

          {/* Perpaduan Garis-Garis Glowing Warna Logo (#1A4B9F & #3886F6) */}
          <svg className="absolute inset-0 w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoLineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1A4B9F" stopOpacity="0" />
                <stop offset="50%" stopColor="#3886F6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="logoLineGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3886F6" stopOpacity="0" />
                <stop offset="50%" stopColor="#1A4B9F" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Glowing Accent Lines */}
            <path d="M-100 200 Q 400 100, 900 400 T 2000 600" fill="none" stroke="url(#logoLineGrad1)" strokeWidth="2.5" />
            <path d="M-100 350 Q 500 250, 1100 500 T 2000 750" fill="none" stroke="url(#logoLineGrad2)" strokeWidth="2" />
            <path d="M-100 500 Q 600 350, 1200 650 T 2000 900" fill="none" stroke="url(#logoLineGrad1)" strokeWidth="1.5" opacity="0.6" />
          </svg>
        </div>

        {/* Content Outer Container: Matches Landing Page Grid Margin Exactly */}
        <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-14 min-h-screen flex flex-col justify-between py-8 sm:py-12 lg:py-14 relative z-10">
          
          {/* Header Section */}
          <header className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Image
                  src="/logo_hd.png"
                  alt="AI-RecruitPro Logo"
                  width={280}
                  height={280}
                  quality={100}
                  unoptimized
                  className="h-8 sm:h-9 md:h-10 w-auto object-contain shrink-0"
                  priority
                />
                <span className="font-extrabold text-xs sm:text-sm md:text-base tracking-tight text-white leading-none">
                  AI-RecruitPro
                </span>
              </div>

              <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#3886F6]">
                Mode Pemeliharaan Sistem
              </div>
            </div>
          </header>

          {/* Hero Headline Section */}
          <main className="my-auto py-10 max-w-4xl space-y-5">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              Pemeliharaan Sistem Sedang Berlangsung
            </h1>

            <p className="text-sm sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              Saat ini platform kami sedang menjalani pemeliharaan rutin untuk peningkatan performa dan keandalan layanan. Layanan publik akan segera kembali aktif setelah proses pemeliharaan selesai.
            </p>
          </main>

          {/* Footer Section */}
          <footer className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} AI-RecruitPro. Seluruh Hak Cipta Dilindungi.</p>
          </footer>

        </div>

      </div>
    );
  }

  return <>{children}</>;
}

