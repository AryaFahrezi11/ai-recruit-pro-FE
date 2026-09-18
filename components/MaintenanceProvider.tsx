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
      <div className="fixed inset-0 z-[9999] min-h-screen w-screen bg-[#040814] text-slate-100 flex flex-col justify-between font-sans antialiased overflow-hidden selection:bg-[#1A4B9F] selection:text-white">
        
        {/* Right Side 3D Geometric Prism Artwork (AWS-style geometric facet design in AI-RecruitPro brand colors) */}
        <div className="absolute top-0 right-0 w-full lg:w-3/5 h-full pointer-events-none overflow-hidden opacity-90">
          {/* Subtle Ambient Glow Orbs */}
          <div className="absolute top-1/4 right-10 w-[500px] h-[500px] bg-[#1A4B9F]/30 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[110px]" />
          
          {/* SVG 3D Geometric Prism Facets */}
          <svg
            className="absolute top-0 right-0 h-full w-full object-cover"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="facet1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1A4B9F" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="facet2" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="facet3" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="darkOverlay" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#040814" stopOpacity="1" />
                <stop offset="45%" stopColor="#040814" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#040814" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Geometric Poly Facets */}
            <path d="M450 0 L1000 0 L1000 1000 L750 1000 Z" fill="url(#facet1)" />
            <path d="M750 0 L1000 250 L1000 1000 L600 1000 Z" fill="url(#facet2)" opacity="0.9" />
            <path d="M850 0 L1000 0 L1000 650 Z" fill="url(#facet3)" opacity="0.8" />
            
            {/* Split Gradient Overlay blending Left Dark Side to Right Prism */}
            <rect width="1000" height="1000" fill="url(#darkOverlay)" />
          </svg>
        </div>

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25 pointer-events-none" />

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

