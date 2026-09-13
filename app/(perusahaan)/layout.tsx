'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useAppStore } from '@/lib/store/useAppStore';
import { fetchAuth } from '@/lib/api/auth';
import { Menu } from 'lucide-react';

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

    // Guard: Verify if company data & documents are complete and approved
    const checkCompanyStatus = async () => {
      try {
        const res = await fetchAuth('/users/profile');
        if (res.ok) {
          const data = await res.json();
          const profil = data.profil;
          if (profil) {
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
    };

    checkCompanyStatus();
  }, [router, pathname]);

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
              className="md:hidden p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4 ml-4">
            {mounted && (
              <>

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
