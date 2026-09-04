'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  GraduationCap, LayoutDashboard, Users, Settings, HelpCircle, 
  Globe, Search, Bell, Menu, X, ArrowLeftRight, Building2,
  CheckCircle2, Video, FileText, ArrowRight, LogOut
} from 'lucide-react';

export default function KampusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isMobileSidebarOpen, toggleMobileSidebar } = useAppStore();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Popover States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: t.sidebar?.dashboard || 'Dasbor Karir', href: '/campus/dashboard', icon: LayoutDashboard },
    { name: t.kampus?.studentsTitle || 'Data Mahasiswa', href: '/campus/students', icon: Users },
  ];

  const bottomItems = [
    { name: t.sidebar?.settings || 'Pengaturan', href: '/campus/settings', icon: Settings },
    { name: t.sidebar?.support || 'Bantuan', href: '/campus/support', icon: HelpCircle },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans transition-colors duration-300 relative">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          onClick={toggleMobileSidebar}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Component for Kampus Portal */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-card border-r border-border flex flex-col justify-between p-4
        transition-transform duration-300 ease-in-out shrink-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="space-y-6">
          
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold shadow-md shadow-violet-600/20">
                <GraduationCap size={22} />
              </div>
              <div>
                <h1 className="font-bold text-sm text-foreground leading-snug">
                  {t.kampus?.portalName || 'Pusat Karir Kampus'}
                </h1>
                <p className="text-[10px] text-muted-foreground font-medium">Career Center Suite</p>
              </div>
            </div>

            <button 
              onClick={toggleMobileSidebar}
              className="md:hidden p-1 text-muted-foreground hover:text-foreground rounded-md"
            >
              <X size={20} />
            </button>
          </div>



          {/* Main Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobileSidebarOpen && toggleMobileSidebar()}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all
                    ${isActive 
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/20' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}
                  `}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Links */}
        <div className="space-y-3 border-t border-border pt-4">
          <nav className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobileSidebarOpen && toggleMobileSidebar()}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}
                  `}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Campus Profile Snippet */}
          <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center text-xs shrink-0">
              UI
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">Universitas Indonesia</p>
              <p className="text-[10px] text-muted-foreground truncate">Career Center Admin</p>
            </div>
          </div>
        </div>

      </aside>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 bg-card/50 backdrop-blur-sm z-10 transition-colors duration-300 relative">
          
          <div className="flex items-center flex-1 max-w-xl gap-3">
            <button 
              onClick={toggleMobileSidebar}
              className="md:hidden p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Cari mahasiswa, NIM, atau jurusan..."
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-transparent focus:border-violet-600 focus:bg-background rounded-lg text-sm transition-colors outline-none font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            
            <div className="flex items-center gap-2 border-l border-border pl-4 ml-2 relative">
              
              {/* Notifications Bell */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground relative"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-violet-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center border border-card">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 sm:w-96 bg-card text-card-foreground border border-border rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-violet-600" />
                        <h4 className="font-bold text-xs">Notifikasi Karir Kampus</h4>
                      </div>
                      <button onClick={() => setUnreadCount(0)} className="text-[10px] font-semibold text-violet-600 hover:underline">
                        Tandai Dibaca
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-muted/40 rounded-lg">
                        <p className="font-bold text-foreground">5 Mahasiswa baru diterima di PT MegaWeb Tech</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">30 menit yang lalu</p>
                      </div>
                      <div className="p-2.5 bg-muted/40 rounded-lg">
                        <p className="font-bold text-foreground">Budi Santoso (Teknik Informatika) lolos ke Tahap 5 Validasi</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">2 jam yang lalu</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Support Link */}
              <Link 
                href="/campus/support"
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
              >
                <HelpCircle size={18} />
              </Link>

              {/* Campus Admin Avatar */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="w-9 h-9 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs border border-violet-400 shadow-2xs cursor-pointer ml-1"
                >
                  UI
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-64 bg-card text-card-foreground border border-border rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="border-b border-border pb-3 mb-3">
                      <p className="text-xs font-bold text-foreground">Universitas Indonesia</p>
                      <p className="text-[10px] text-muted-foreground">Career Center Administrator</p>
                      <span className="inline-block px-2 py-0.5 bg-violet-100 dark:bg-violet-950/60 text-violet-900 dark:text-violet-300 font-bold text-[9px] rounded mt-1">
                        Campus Partner Portal
                      </span>
                    </div>

                    <div className="space-y-1">
                      <Link href="/campus/students" onClick={() => setShowProfileMenu(false)} className="block px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted">
                        Data Mahasiswa
                      </Link>
                      <Link href="/campus/settings" onClick={() => setShowProfileMenu(false)} className="block px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted">
                        Pengaturan Kampus
                      </Link>
                      <Link href="/campus/support" onClick={() => setShowProfileMenu(false)} className="block px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted">
                        Pusat Bantuan Kampus
                      </Link>
                    </div>

                    <div className="border-t border-border pt-2 mt-2">
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false);
                          setShowLogoutModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut size={14} />
                        Keluar (Logout)
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background transition-colors duration-300">
          {children}
        </main>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card text-card-foreground border border-border w-full max-w-sm rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <LogOut size={20} />
              </div>
              <div>
                <h3 className="text-base font-black">Konfirmasi Keluar</h3>
                <p className="text-xs text-muted-foreground">
                  Apakah Anda yakin ingin keluar?
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded-2xl border border-border">
              Anda perlu melakukan login kembali untuk dapat mengelola data mahasiswa dan dasbor kampus.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  setShowLogoutModal(false);
                  toast.success('Berhasil keluar dari akun Kampus.');
                }}
                className="px-5 py-2 rounded-full text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-colors cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
