'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileUp, 
  Video, 
  ClockCheck, 
  Bell, 
  HelpCircle,
  LogOut
} from 'lucide-react';

export default function PelamarPerfectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Exclude public authentication pages from route guard
    const isAuthPage = pathname === '/pelamar/login' || pathname === '/pelamar/register';
    
    if (isAuthPage) {
      setIsAuthenticated(true);
      return;
    }

    // Check candidate session state in localStorage
    const loggedIn = localStorage.getItem('isPelamarLoggedIn');
    if (!loggedIn || loggedIn !== 'true') {
      setIsAuthenticated(false);
      router.push('/pelamar/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('isPelamarLoggedIn');
    router.push('/pelamar/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/pelamar/dashboard', icon: LayoutDashboard },
    { name: '1. Upload CV', href: '/pelamar/upload-cv', icon: FileUp },
    { name: '2. Wawancara Video', href: '/pelamar/wawancara', icon: Video },
    { name: '3. Status Validasi', href: '/pelamar/status', icon: ClockCheck },
  ];

  // If on login/register pages, render children without candidate layout navbar
  if (pathname === '/pelamar/login' || pathname === '/pelamar/register') {
    return <>{children}</>;
  }

  // Prevent flash while checking session
  if (isAuthenticated === false) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F4FDFB] text-[#0F766E] flex flex-col font-sans antialiased">
      {/* Top Navbar - Perfect Harmony (Height: 80px / h-20) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#CCFBF1] shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Subtle Tag */}
          <div className="flex items-center gap-4">
            <Link href="/pelamar/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white font-black text-xl shadow-sm group-hover:scale-105 transition-transform duration-200">
                RP
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#0F766E] leading-none">
                  AI-Recruit <span className="text-[#0D635C]">Pro</span>
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  Candidate Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Clean Nav Pill Links */}
          <nav className="hidden md:flex items-center gap-2 bg-[#F4FDFB] p-1.5 rounded-full border border-[#CCFBF1]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#0F766E] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-[#0F766E] hover:bg-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#E6FFFA]' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <button 
              className="p-2.5 rounded-xl text-slate-500 hover:text-[#0F766E] hover:bg-[#E6FFFA] transition-colors relative"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0F766E]"></span>
            </button>

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

            {/* Profile Avatar & Logout */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0F766E] border-2 border-[#CCFBF1] text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                  alt="Candidate Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs sm:text-sm font-bold text-[#0F766E] leading-snug">Budi Pratama</span>
                <span className="text-xs text-slate-500 font-medium">Candidate #APL-8921</span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Keluar (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around bg-white border-t border-[#CCFBF1] py-2 px-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap ${
                  isActive ? 'text-[#0F766E]' : 'text-slate-400'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F766E]' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 sm:px-10 lg:px-16 py-8 sm:py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#CCFBF1] py-8 mt-12">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#0F766E]">AI-Recruit Pro</span>
            <span>&copy; {new Date().getFullYear()} PO-FIT Recruitment Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="inline-flex items-center gap-2 bg-[#E6FFFA] text-[#0F766E] px-4 py-1.5 rounded-full font-bold text-xs border border-[#99F6E4]">
              <span className="w-2 h-2 rounded-full bg-[#0F766E]"></span>
              System Active &amp; Secure
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
