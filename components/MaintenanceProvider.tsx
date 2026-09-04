'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { ShieldAlert } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getApiUrl } from '@/lib/api';

export default function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAppStore(state => state.user);
  const pathname = usePathname();

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await fetch(getApiUrl('/config/public'));
        if (res.ok) {
          const config = await res.json();
          if (config.maintenance_mode === true) {
            setIsMaintenance(true);
          } else {
            setIsMaintenance(false);
          }
        }
      } catch (e) {
        // Silently fail if API is down
        console.error("Failed to check maintenance mode:", e);
      } finally {
        setIsLoading(false);
      }
    };

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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mb-8">
          <ShieldAlert size={48} className="text-rose-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Sistem Sedang Dalam Perbaikan</h1>
        <p className="text-slate-400 text-lg max-w-lg mb-8">
          Kami sedang melakukan pemeliharaan sistem rutin untuk meningkatkan pengalaman Anda. Silakan kembali beberapa saat lagi.
        </p>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-800/50 px-6 py-3 rounded-full">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
          Maintenance in progress
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
