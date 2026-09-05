'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, Users, ShieldCheck, LogOut, Settings, Bell, Search, Menu, X, Briefcase, Database, LineChart, FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default false untuk mobile overlay
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    // If not on login page and not authenticated as admin, redirect to login
    if (pathname !== '/admin/login' && (!user || user.role !== 'admin')) {
      router.replace('/admin/login');
    }
    // If on login page but already authenticated as admin, redirect to dashboard
    if (pathname === '/admin/login' && user && user.role === 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [user, router, pathname]);

  // If it's the login page, just render the login content (no sidebar/header)
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Prevent rendering admin layout if not authorized
  if (!user || user.role !== 'admin') {
    return null; // Loading state
  }

  const handleLogout = () => {
    logout();
    toast.success('Logout Admin Berhasil');
    router.push('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Manajemen Lowongan', icon: Briefcase, href: '/admin/jobs' },
    { label: 'Manajemen Pengguna', icon: Users, href: '/admin/users' },
    { label: 'Verifikasi Perusahaan', icon: ShieldCheck, href: '/admin/verifikasi' },
    { label: 'Master Data', icon: Database, href: '/admin/master-data' },
  ];

  return (
    // 1. KUNCI UTAMA: Batasi tinggi container utama setinggi viewport (h-screen) & matikan overflow ganda
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden">
      
      {/* Overlay Gelap untuk Mobile (Opsional saat menu mobile terbuka) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* 2. SIDEBAR: Gunakan sticky + h-screen agar terkunci rapat di kiri */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 w-64 shrink-0 transform transition-transform duration-300 z-50 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="h-full flex flex-col justify-between">
          
          {/* Top Section */}
          <div>
            <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                <Image
                  src="/Logo Ai Recruit Pro..png"
                  alt="AI-RecruitPro Logo"
                  width={44}
                  height={44}
                  className="h-10 w-auto object-contain shrink-0"
                  priority
                />
                <div className="flex flex-col justify-center">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                    AI-RecruitPro
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Portal Admin
                  </span>
                </div>
              </Link>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-black dark:hover:text-white">
                <X size={20} className="text-black dark:text-white" />
              </button>
            </div>

            <div className="py-6 px-3 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">Menu Utama</div>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold shadow-2xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <item.icon size={18} className="text-black dark:text-white shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <Link
              href="/admin/audit-logs"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                pathname === '/admin/audit-logs'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <FileText size={18} className="text-black dark:text-white shrink-0" />
              Catatan Sistem
            </Link>
            <Link
              href="/admin/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                pathname === '/admin/settings'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Settings size={18} className="text-black dark:text-white shrink-0" />
              Pengaturan Sistem
            </Link>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors w-full cursor-pointer"
            >
              <LogOut size={18} className="text-rose-600 shrink-0" />
              Keluar Sistem
            </button>
          </div>

        </div>
      </aside>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 border border-slate-200 w-full max-w-sm rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-2">Konfirmasi Keluar</h3>
            <p className="text-sm text-slate-500 mb-6">
              Apakah Anda yakin ingin keluar dari sistem Admin?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100 text-slate-600 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. AREA KONTEN UTAMA: Berikan h-screen dan overflow-y-auto di sini saja */}
      <main className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Header (Sticky di Atas Konten - Mobile Only Toggle) */}
        <header className="h-14 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 z-30 lg:hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
              <Menu size={24} className="text-black dark:text-white" />
            </button>
          </div>
        </header>

        {/* Page Content (Scrollbar Hanya Berada di Sini) */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
}