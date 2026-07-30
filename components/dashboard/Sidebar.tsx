'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Archive,
  Settings,
  HelpCircle,
  Plus,
  GraduationCap,
  ArrowLeftRight
} from 'lucide-react';

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { isMobileSidebarOpen, setMobileSidebar } = useAppStore();

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
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold text-xl shrink-0 shadow-md shadow-primary/20">
              RP
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">{t.sidebar.recruitmentPortal}</h1>
              <p className="text-xs text-muted-foreground">{t.sidebar.hrValidationSuite}</p>
            </div>
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
          </nav>
        </div>
      </div>
    </>
  );
}
