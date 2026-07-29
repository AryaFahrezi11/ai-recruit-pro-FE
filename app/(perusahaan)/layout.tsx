'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useAppStore } from '@/lib/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Sun, Moon, Globe, Search, Bell, HelpCircle, Menu, 
  CheckCircle2, Video, FileText, User, Settings, LogOut, X, ArrowRight 
} from 'lucide-react';

export default function PerusahaanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, toggleTheme, language, setLanguage, toggleMobileSidebar } = useAppStore();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Popover States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  // Mock Notifications
  const notifications = [
    {
      id: 1,
      title: 'David Kim mengunggah video wawancara',
      time: '10 menit yang lalu',
      type: 'video',
      icon: <Video size={14} className="text-violet-500" />,
      link: '/pipeline'
    },
    {
      id: 2,
      title: 'Alex Mercer lolos seleksi CV PO-FIT (92%)',
      time: '1 jam yang lalu',
      type: 'cv',
      icon: <FileText size={14} className="text-emerald-500" />,
      link: '/pipeline'
    },
    {
      id: 3,
      title: 'Lowongan Frontend Developer menerima pelamar baru',
      time: '3 jam yang lalu',
      type: 'applicant',
      icon: <CheckCircle2 size={14} className="text-blue-500" />,
      link: '/jobs'
    }
  ];

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans transition-colors duration-300 relative">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Navbar for actions (Search, Theme, Language, User profile) */}
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
                placeholder={t.pipeline?.search || 'Search candidates...'}
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-transparent focus:border-primary focus:bg-background rounded-lg text-sm transition-colors outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-4">
            {mounted && (
              <>
                <button
                  onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted text-sm font-medium transition-colors border border-border"
                  title="Toggle Language"
                >
                  <Globe size={16} className="text-muted-foreground" />
                  {language.toUpperCase()}
                </button>

                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors border border-border text-muted-foreground"
                  title="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </>
            )}
            
            <div className="flex items-center gap-2 border-l border-border pl-4 ml-2 relative">
              
              {/* Notification Bell Button */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground relative"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border border-card">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 sm:w-96 bg-card text-card-foreground border border-border rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-primary" />
                        <h4 className="font-bold text-xs">Notifikasi Aktivitas AI</h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 font-bold text-[10px] rounded-full">
                            {unreadCount} Baru
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={markAllRead} 
                        className="text-[10px] font-semibold text-primary hover:underline"
                      >
                        Tandai Dibaca
                      </button>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                      {notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.link}
                          onClick={() => setShowNotifications(false)}
                          className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="p-2 rounded-lg bg-muted shrink-0 mt-0.5">
                            {n.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-foreground leading-snug">{n.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-border pt-2 mt-3 text-center">
                      <Link 
                        href="/pipeline" 
                        onClick={() => setShowNotifications(false)}
                        className="text-[11px] font-semibold text-primary hover:underline flex items-center justify-center gap-1"
                      >
                        Lihat Semua Aktivitas Pipeline
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Support Link Icon */}
              <Link 
                href="/support"
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                title="Pusat Bantuan & Dok AI"
              >
                <HelpCircle size={18} />
              </Link>

              {/* Profile Avatar Button */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="w-9 h-9 rounded-full overflow-hidden bg-primary/20 border border-border ml-1 focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
                  title="Profil User HR"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80" alt="Profile" className="w-full h-full object-cover" />
                </button>

                {/* Profile Popover Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-64 bg-card text-card-foreground border border-border rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 border-b border-border pb-3 mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80" alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">Arya Fahrezi</p>
                        <p className="text-[10px] text-muted-foreground truncate">Lead HR Manager</p>
                        <span className="inline-block px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[9px] rounded mt-0.5">
                          Enterprise Admin
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link 
                        href="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <Settings size={14} className="text-muted-foreground" />
                        Pengaturan Sistem HR
                      </Link>
                      <Link 
                        href="/support"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <HelpCircle size={14} className="text-muted-foreground" />
                        Pusat Bantuan AI
                      </Link>
                    </div>

                    <div className="border-t border-border pt-2 mt-2">
                      <button 
                        onClick={() => {
                          setShowProfileMenu(false);
                          alert('Simulasi Logout berhasil.');
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
    </div>
  );
}
