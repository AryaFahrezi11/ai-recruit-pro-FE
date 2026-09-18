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
      <div className="fixed inset-0 z-[9999] min-h-screen w-screen bg-[#040814] text-slate-100 flex flex-col justify-between p-6 sm:p-12 lg:p-16 font-sans antialiased overflow-hidden selection:bg-[#1A4B9F] selection:text-white">
        
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

        {/* Header Section (Brand Identity & Eyebrow Tag) */}
        <header className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Image
                src="/logo_hd.png"
                alt="AI-RecruitPro Logo"
                width={280}
                height={280}
                quality={100}
                unoptimized
                className="h-9 sm:h-11 w-auto object-contain shrink-0"
                priority
              />
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white leading-none">
                AI-RecruitPro
              </span>
            </div>

            <div className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.2em] text-blue-400/90">
              AI-RECRUITPRO SYSTEM MAINTENANCE
            </div>
          </div>

          {/* Live Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-blue-500/30 backdrop-blur-md text-blue-300 text-xs font-semibold tracking-wide shrink-0 shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span>Pemeliharaan Terjadwal</span>
          </div>
        </header>

        {/* Hero Headline & Content Section */}
        <main className="relative z-10 my-auto py-12 max-w-4xl space-y-6">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
            Pemeliharaan & Peningkatan Sistem Sedang Berlangsung
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
            Saat ini tim teknis kami sedang memperbarui infrastruktur server untuk meningkatkan performa, keandalan sistem, dan kecepatan rekrutmen. Layanan publik akan segera kembali aktif setelah proses pemeliharaan selesai.
          </p>

          {/* Status Bar Indicator */}
          <div className="pt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Status Server: <strong className="text-white">Upgrading</strong></span>
            </div>
            
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Keamanan & Data: <strong className="text-white">100% Terenkripsi</strong></span>
            </div>
          </div>
        </main>

        {/* Footer Section */}
        <footer className="relative z-10 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} AI-RecruitPro. Seluruh Hak Cipta Dilindungi.</p>
          <p className="font-mono text-[11px] text-slate-600">SLA Availability: 99.9% Optimal</p>
        </footer>

      </div>
    );
  }

  return <>{children}</>;
}

