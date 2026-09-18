'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAppStore } from '@/lib/store/useAppStore';
import { RefreshCw, Server, ShieldCheck, Zap, Lock } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getApiUrl } from '@/lib/api';

export default function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const user = useAppStore((state) => state.user);
  const pathname = usePathname();

  const checkMaintenance = async () => {
    setIsChecking(true);
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
      setTimeout(() => setIsChecking(false), 500);
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
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans antialiased relative overflow-hidden selection:bg-[#1A4B9F] selection:text-white">
        
        {/* Subtle Enterprise Backdrop Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1A4B9F]/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Main Glassmorphism Card Container */}
        <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-blue-950/50 relative z-10 space-y-8 overflow-hidden text-left">
          
          {/* Top Subtle Brand Gradient Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#1A4B9F] to-transparent" />

          {/* Header & Brand Identity (Matches Landing Page Navbar) */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo_hd.png"
                alt="AI-RecruitPro Logo"
                width={280}
                height={280}
                quality={100}
                unoptimized
                className="h-8 sm:h-9 w-auto object-contain shrink-0"
                priority
              />
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-none block">
                  AI-RecruitPro
                </span>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                  Platform Rekrutmen Cerdas
                </span>
              </div>
            </div>

            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold tracking-wider uppercase shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Maintenance Mode</span>
            </div>
          </div>

          {/* Big Tech Style Visual Animation Section */}
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
            
            {/* Concentric Pulsing Server Status Rings */}
            <div className="relative flex items-center justify-center w-24 h-24 my-2">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping opacity-30" />
              <div className="absolute inset-2 rounded-full border border-blue-400/30 animate-pulse" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A4B9F] to-slate-900 border border-blue-400/30 flex items-center justify-center text-white shadow-xl shadow-blue-900/30">
                <Server size={30} className="text-blue-200" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2 max-w-md mx-auto">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Pemeliharaan & Peningkatan Sistem
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-normal leading-relaxed">
                Saat ini tim teknis kami sedang memperbarui infrastruktur server untuk meningkatkan performa, sistem keamanan, dan keandalan platform rekrutmen.
              </p>
            </div>

            {/* Animated Status Shimmer Bar */}
            <div className="w-full max-w-sm bg-slate-950/80 border border-slate-800 rounded-full p-1 mt-2">
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden relative">
                <div className="bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-500 h-full w-2/3 rounded-full animate-pulse" />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-mono font-medium">
              Mengoptimalkan Server & Database...
            </span>
          </div>

          {/* Status Metrics Box */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
            <div className="p-2 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <Zap size={15} className="mx-auto text-blue-400 mb-1" />
              <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
              <div className="text-xs font-bold text-white mt-0.5 truncate">Terjadwal</div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <Lock size={15} className="mx-auto text-emerald-400 mb-1" />
              <div className="text-[10px] uppercase font-bold text-slate-400">Keamanan</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5 truncate">Terenkripsi</div>
            </div>

            <div className="p-2 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <ShieldCheck size={15} className="mx-auto text-indigo-400 mb-1" />
              <div className="text-[10px] uppercase font-bold text-slate-400">Data Anda</div>
              <div className="text-xs font-bold text-white mt-0.5 truncate">100% Aman</div>
            </div>
          </div>

          {/* Action Buttons (Consistent rounded-full styling) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => checkMaintenance()}
              disabled={isChecking}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#1A4B9F] hover:bg-[#133878] active:scale-95 disabled:opacity-75 text-white text-xs sm:text-sm font-bold rounded-full transition-all duration-200 flex items-center justify-center gap-2 border border-blue-500/30 shadow-lg shadow-blue-900/40 cursor-pointer"
            >
              <RefreshCw size={15} className={isChecking ? 'animate-spin' : ''} />
              <span>{isChecking ? 'Mengecek Status...' : 'Cek Status Ulang'}</span>
            </button>

            <Link
              href="/admin/login"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold rounded-full border border-slate-700/80 transition-all duration-200 text-center"
            >
              Akses Portal Admin &rarr;
            </Link>
          </div>

          {/* Footer Copyright */}
          <div className="text-center pt-2 border-t border-slate-800/60">
            <p className="text-[11px] text-slate-500">
              &copy; {new Date().getFullYear()} AI-RecruitPro. Seluruh hak cipta dilindungi.
            </p>
          </div>

        </div>
      </div>
    );
  }

  return <>{children}</>;
}

