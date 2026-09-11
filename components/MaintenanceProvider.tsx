'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Wrench, RefreshCw } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getApiUrl } from '@/lib/api';

export default function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAppStore((state) => state.user);
  const pathname = usePathname();

  const checkMaintenance = async () => {
    try {
      const res = await fetch(getApiUrl('/config/public')).catch(() => null);
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans antialiased">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
          
          {/* Header & Brand */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0">
                <Wrench size={16} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">AI Recruit Pro</span>
                <span className="text-[11px] text-slate-500 font-medium">Platform Rekrutmen Cerdas</span>
              </div>
            </div>
            
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono font-bold border border-slate-700">
              MAINTENANCE
            </span>
          </div>

          {/* Body Content */}
          <div className="space-y-2">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Pemeliharaan Sistem Sedang Berlangsung
            </h1>
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              Saat ini tim teknis kami sedang melakukan pemeliharaan rutin untuk peningkatan performa dan keandalan sistem. Layanan publik sementara dinonaktifkan dan akan kembali aktif setelah pemeliharaan selesai.
            </p>
          </div>

          {/* Info Card / Status Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>Status Platform</span>
              <span className="text-slate-400 font-mono text-[11px]">Pemeliharaan Terjadwal</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Terima kasih atas kesabaran dan kerja sama Anda.
            </p>
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex items-center justify-between gap-3 text-xs">
            <button
              onClick={() => checkMaintenance()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw size={13} />
              <span>Cek Status Ulang</span>
            </button>

            <a
              href="/admin/login"
              className="text-slate-500 hover:text-slate-300 text-[11px] font-medium transition-colors underline"
            >
              Akses Portal Admin &rarr;
            </a>
          </div>

        </div>
      </div>
    );
  }

  return <>{children}</>;
}
