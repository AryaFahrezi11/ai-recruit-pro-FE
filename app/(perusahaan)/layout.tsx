'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useAppStore } from '@/lib/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Globe, Search, Bell, HelpCircle, Menu, 
  CheckCircle2, Video, FileText, User, Settings, LogOut, X, ArrowRight 
} from 'lucide-react';

export default function PerusahaanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { language, setLanguage, toggleMobileSidebar, logout } = useAppStore();
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

  // Prevent hydration mismatch and check auth
  useEffect(() => {
    setMounted(true);
    
    const role = localStorage.getItem('user_role');
    const token = localStorage.getItem('access_token');
    
    if (!token || role !== 'perusahaan') {
      if (role === 'pelamar') {
        router.push('/applicant/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [router]);

  const markAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans transition-colors duration-300 relative">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Navbar for actions (Search, Theme, Language, User profile) */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 bg-card/50 backdrop-blur-sm z-10 transition-colors duration-300 relative">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMobileSidebar}
              className="md:hidden p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4 ml-4">
            {mounted && (
              <>


                <button
                  onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-muted transition-colors border border-border text-muted-foreground font-bold text-xs"
                  title="Toggle Language"
                >
                  <Globe size={16} />
                  <span>{language.toUpperCase()}</span>
                </button>
              </>
            )}
            

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
