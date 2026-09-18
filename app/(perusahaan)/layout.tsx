'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useAppStore } from '@/lib/store/useAppStore';
import { fetchAuth } from '@/lib/api/auth';
import { getMediaUrl } from '@/lib/api';
import { Menu, Building2 } from 'lucide-react';

export default function PerusahaanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleMobileSidebar } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<{
    nama_perusahaan: string;
    industri: string;
    logo_url: string;
  }>({
    nama_perusahaan: '',
    industri: '',
    logo_url: ''
  });

  const checkCompanyStatus = useCallback(async () => {
    try {
      const res = await fetchAuth('/users/profile');
      if (res.ok) {
        const data = await res.json();
        const profil = data.profil;
        if (profil) {
          setCompanyProfile({
            nama_perusahaan: profil.nama_perusahaan || 'Perusahaan',
            industri: profil.industri || 'Industri Bisnis',
            logo_url: profil.logo_url ? getMediaUrl(profil.logo_url) : (data.avatar_url ? getMediaUrl(data.avatar_url) : '')
          });

          if (!profil.has_completed_profile) {
            toast.error('Data diri dan dokumen legalitas perusahaan belum lengkap. Mengalihkan ke Tahap 3...', { id: 'incomplete-profile' });
            router.push('/register?step=3');
            return; // Do not setIsChecking(false) to hide dashboard while redirecting
          }
          if (!profil.is_verified) {
            toast('Akun perusahaan Anda sedang menunggu peninjauan dokumen oleh Admin.', { icon: '⏳', id: 'pending-approval' });
            router.push('/pending-approval');
            return; // Do not setIsChecking(false)
          }
          
          // Check if settings profile is completed
          const hasCompletedSettings = profil.deskripsi && profil.kota && profil.provinsi && profil.no_telepon && profil.tahun_berdiri && profil.logo_url;
          if (!hasCompletedSettings) {
            setIsProfileIncomplete(true);
            if (pathname !== '/settings') {
              toast.error('Mohon lengkapi profil perusahaan Anda terlebih dahulu.', { id: 'incomplete-settings' });
              router.push('/settings?onboarding=true');
              setIsChecking(false);
              return;
            }
          } else {
            setIsProfileIncomplete(false);
          }
        }
      }
      setIsChecking(false);
    } catch (err) {
      // Ignore network offline errors
      setIsChecking(false);
    }
  }, [router, pathname]);

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
      return;
    }

    checkCompanyStatus();

    const handleProfileUpdated = () => {
      checkCompanyStatus();
    };
    window.addEventListener('company_profile_updated', handleProfileUpdated);
    return () => {
      window.removeEventListener('company_profile_updated', handleProfileUpdated);
    };
  }, [router, pathname, checkCompanyStatus]);

  if (!mounted) return null;
  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A4B9F]"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans transition-colors duration-300 relative">
      <Sidebar isBlocked={isProfileIncomplete} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Navbar for actions (Search, Theme, Language, User profile) */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 bg-card/50 backdrop-blur-sm z-10 transition-colors duration-300 relative">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleMobileSidebar}
              className="md:hidden p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Top Right: Company Logo, Name, and Industry */}
          <div className="flex items-center gap-3 ml-auto">
            {mounted && (companyProfile.nama_perusahaan || companyProfile.logo_url) && (
              <Link
                href="/settings"
                className="flex items-center gap-2.5 sm:gap-3 p-1 sm:p-1.5 pl-2.5 sm:pl-3 rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-[#1A4B9F]/40 dark:hover:border-blue-500/40 bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all group shadow-2xs"
                title="Pengaturan Profil Perusahaan"
              >
                {/* Text Info: Nama Perusahaan & Bidang Industri */}
                <div className="flex flex-col items-end text-right min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1A4B9F] dark:group-hover:text-blue-400 transition-colors truncate max-w-[130px] sm:max-w-[200px]">
                      {companyProfile.nama_perusahaan}
                    </span>
                    <Building2 size={13} className="text-[#1A4B9F] dark:text-blue-400 shrink-0 hidden sm:block" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[130px] sm:max-w-[200px]">
                    {companyProfile.industri || 'Industri Bisnis'}
                  </span>
                </div>

                {/* Logo Perusahaan */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800 overflow-hidden shrink-0 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                  {companyProfile.logo_url ? (
                    <img
                      src={companyProfile.logo_url}
                      alt={companyProfile.nama_perusahaan || 'Logo Perusahaan'}
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%231A4B9F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z'/%3E%3Cpath d='M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2'/%3E%3Cpath d='M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2'/%3E%3Cpath d='M10 6h4'/%3E%3Cpath d='M10 10h4'/%3E%3Cpath d='M10 14h4'/%3E%3Cpath d='M10 18h4'/%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <Building2 size={18} className="text-[#1A4B9F]" />
                  )}
                </div>
              </Link>
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
