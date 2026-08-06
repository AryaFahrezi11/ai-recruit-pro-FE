'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, ShieldCheck, LogOut, Settings, Bell, Search, Menu, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    { label: 'Manajemen Pengguna', icon: Users, href: '/admin/users' },
    { label: 'Verifikasi Perusahaan', icon: ShieldCheck, href: '/admin/verifikasi' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-[#0c2b3d] text-white w-64 transform transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
                RP
              </div>
              <span className="font-bold text-lg tracking-tight">Admin<span className="text-blue-400">Portal</span></span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 py-6 px-4 space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 ml-2">Main Menu</div>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600/20 text-blue-400' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <item.icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors w-full"
            >
              <LogOut size={18} />
              Keluar Sistem
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Cari data..." className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-64" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
}
