'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/lib/store/useAppStore';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Archive,
  Settings,
  HelpCircle,
  Plus,
  GraduationCap,
  ArrowLeftRight,
  LogOut
} from 'lucide-react';

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileSidebarOpen, setMobileSidebar, logout } = useAppStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = [
    { name: t.sidebar.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: t.sidebar.candidatePipeline, href: '/pipeline', icon: Users },
    { name: t.sidebar.jobOpenings, href: '/jobs', icon: Briefcase },
    { name: t.sidebar.archive, href: '/archive', icon: Archive },
  ];

  const bottomItems = [
    { name: t.sidebar.settings, href: '/settings', icon: Settings },
    { name: t.sidebar.support, href: '/support', icon: HelpCircle },
  ];

  // Close sidebar on link click (mobile)
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setMobileSidebar(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-border h-full flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          <div className="flex items-center gap-2.5 mb-2 px-1 cursor-default">
            <Image
              src="/Logo Ai Recruit Pro..png"
              alt="AI-RecruitPro Logo"
              width={44}
              height={44}
              className="h-10 w-auto object-contain shrink-0"
            />
            <span className="font-bold text-lg tracking-tight text-[#0D3880] dark:text-white leading-none">
              AI-RecruitPro
            </span>
          </div>



          <Link 
            href="/jobs/new" 
            onClick={handleLinkClick}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm text-xs active:scale-95"
          >
            <Plus size={18} />
            {t.sidebar.createNewJob}
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-sidebar-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <item.icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-5 border-t border-border/50">
          <nav className="space-y-1">
            {bottomItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-sidebar-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <item.icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left mt-2"
            >
              <LogOut size={18} className="text-rose-500" />
              Keluar (Logout)
            </button>
          </nav>
        </div>
      </div>
      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border w-full max-w-sm rounded-2xl shadow-xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-2">Konfirmasi Keluar</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Apakah Anda yakin ingin keluar dari akun perusahaan?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-muted text-foreground transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                  toast.success('Berhasil keluar dari akun perusahaan.');
                  router.push('/login');
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
