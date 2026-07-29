'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useAppStore } from '@/lib/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Sun, Moon, Globe, Search, Bell, HelpCircle, Menu } from 'lucide-react';

export default function PerusahaanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, toggleTheme, language, setLanguage, toggleMobileSidebar } = useAppStore();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans transition-colors duration-300 relative">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Navbar for actions (Search, Theme, Language, User profile) */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 bg-card/50 backdrop-blur-sm z-10 transition-colors duration-300">
          
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
            
            <div className="flex items-center gap-2 border-l border-border pl-4 ml-2">
              <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
                <Bell size={18} />
              </button>
              <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
                <HelpCircle size={18} />
              </button>
              <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/20 border border-border ml-2">
                <img src="https://i.pravatar.cc/150?img=47" alt="Profile" className="w-full h-full object-cover" />
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
