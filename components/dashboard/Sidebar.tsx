'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  MessageSquare,
  Archive,
  Settings,
  HelpCircle,
  Plus
} from 'lucide-react';

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { isMobileSidebarOpen, setMobileSidebar } = useAppStore();

  const navItems = [
    { name: t.sidebar.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: t.sidebar.candidatePipeline, href: '/pipeline', icon: Users },
    { name: t.sidebar.aiInsights, href: '/insights', icon: BrainCircuit },
    { name: t.sidebar.teamReviews, href: '/reviews', icon: MessageSquare },
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
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl shrink-0">
              RP
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{t.sidebar.recruitmentPortal}</h1>
              <p className="text-xs text-muted-foreground">{t.sidebar.hrValidationSuite}</p>
            </div>
          </div>

          <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 mb-8 transition-colors shadow-sm">
            <Plus size={20} />
            {t.sidebar.createNewJob}
          </button>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-sidebar-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-border/50">
          <nav className="space-y-1">
            {bottomItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <item.icon size={20} className="text-muted-foreground" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
