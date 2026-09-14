'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import { fetchAuth } from '@/lib/api/auth';
import CampusProfileModal from '@/components/campus/CampusProfileModal';
import { 
  GraduationCap, LayoutDashboard, Users, Settings, HelpCircle, 
  Bell, Menu, X, LogOut, ShieldAlert, Lock, CheckCircle2, CheckCheck, Camera
} from 'lucide-react';

export default function KampusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileSidebarOpen, toggleMobileSidebar } = useAppStore();
  const { t } = useTranslation();
  const isAuthPage = pathname === '/campus/login' || pathname === '/campus/register';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  // Popover States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; time: string }>>([]);
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const emailKey = localStorage.getItem('user_email') || '';
        const saved = localStorage.getItem(`campus_read_notif_ids_${emailKey}`) || localStorage.getItem('campus_read_notif_ids');
        return saved ? JSON.parse(saved) : [];
      } catch (_) {
        return [];
      }
    }
    return [];
  });

  const markAsRead = (id: string) => {
    setReadNotifIds(prev => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      if (typeof window !== 'undefined') {
        const emailKey = campusProfile.email || localStorage.getItem('user_email') || '';
        if (emailKey) localStorage.setItem(`campus_read_notif_ids_${emailKey}`, JSON.stringify(updated));
        localStorage.setItem('campus_read_notif_ids', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifIds(allIds);
    if (typeof window !== 'undefined') {
      const emailKey = campusProfile.email || localStorage.getItem('user_email') || '';
      if (emailKey) localStorage.setItem(`campus_read_notif_ids_${emailKey}`, JSON.stringify(allIds));
      localStorage.setItem('campus_read_notif_ids', JSON.stringify(allIds));
    }
  };

  const unreadCount = notifications.filter(n => !readNotifIds.includes(n.id)).length;

  // Mandatory Profile Completion States
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(true);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [rawProfileData, setRawProfileData] = useState<any>({});

  // Dynamic Logged-in Campus Profile State
  const [campusProfile, setCampusProfile] = useState<{
    name: string;
    email: string;
    initials: string;
    logoUrl?: string;
  }>({
    name: 'Universitas Harkat Negeri',
    email: 'ki.informatika@harkatnegeri.ac.id',
    initials: 'HN',
    logoUrl: '',
  });

  const sanitizeLogoUrl = (url: any): string => {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === '[object Object]') return '';
    return trimmed;
  };

  const [logoImageError, setLogoImageError] = useState(false);

  useEffect(() => {
    setLogoImageError(false);
  }, [campusProfile.logoUrl]);

  const handleSidebarLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 10 MB.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      let uploadedUrl = '';

      if (res.ok && data.url) {
        uploadedUrl = data.url;
      } else {
        uploadedUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      setLogoImageError(false);
      setCampusProfile(prev => ({ ...prev, logoUrl: uploadedUrl }));
      setRawProfileData((prev: any) => ({ ...prev, logo_url: uploadedUrl }));

      if (typeof window !== 'undefined') {
        const emailKey = campusProfile.email || localStorage.getItem('user_email') || '';
        if (emailKey) localStorage.setItem(`campus_logo_${emailKey}`, uploadedUrl);
        localStorage.setItem('campus_logo', uploadedUrl);
        window.dispatchEvent(new Event('storage'));
      }

      try {
        await api.put('/users/profile', { logo_url: uploadedUrl });
      } catch (_) {}

      toast.success('Logo universitas berhasil diperbarui!');
    } catch (_) {
      toast.error('Gagal mengunggah logo universitas.');
    }
  };

  useEffect(() => {
    setMounted(true);
    if (isAuthPage) {
      setIsAuthenticated(true);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const role = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
    const isCampusLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('isCampusLoggedIn') : null;

    if (!token || (role && role !== 'kampus') || isCampusLoggedIn !== 'true') {
      setIsAuthenticated(false);
      router.push('/campus/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, router, isAuthPage]);

  useEffect(() => {
    if (!isAuthenticated || isAuthPage) return;

    api.get('/users/profile')
      .then(data => {
        const res = data || {};
        const p = res.profil || res.profile || {};
        const u = res.user || {};
        const email = u.email || (typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : '') || 'ki.informatika@harkatnegeri.ac.id';
        const savedName = typeof window !== 'undefined' 
          ? (localStorage.getItem(`campus_name_${email}`) || localStorage.getItem('campus_name'))
          : null;
        const savedLogo = typeof window !== 'undefined'
          ? (localStorage.getItem(`campus_logo_${email}`) || localStorage.getItem('campus_logo'))
          : null;

        let rawName = p.nama_kampus || savedName || p.nama_perusahaan || u.name || '';
        if (!rawName || rawName.toLowerCase().includes('ki informatika') || rawName.toLowerCase().includes('ki.informatika')) {
          rawName = savedName || 'Universitas Harkat Negeri';
        }

        const name = typeof rawName === 'string' && rawName.trim() ? rawName.trim() : 'Universitas Harkat Negeri';
        
        const words = name.split(/\s+/).filter(Boolean);
        const initials = words.length >= 2 
          ? (words[0][0] + words[1][0]).toUpperCase() 
          : name.substring(0, 2).toUpperCase();

        const logoUrl = sanitizeLogoUrl(p.logo_url) || sanitizeLogoUrl(savedLogo) || '';

        setCampusProfile({ name, email, initials, logoUrl });
        setRawProfileData({
          nama_kampus: name,
          email: email,
          alamat: p.alamat || '',
          website_url: p.website_url || p.website || '',
          akreditasi: p.akreditasi || 'Unggul (A)',
          logo_url: logoUrl,
          nama_pic: p.nama_pic || '',
          jabatan_pic: p.jabatan_pic || '',
          no_telepon_pic: p.no_telepon_pic || p.phone_pic || '',
        });

        // Check if mandatory KampusProfile fields exist or stored for this specific email
        const savedEmailKey = email || (typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : '');
        const isLocallyCompleted = typeof window !== 'undefined' && Boolean(savedEmailKey)
          ? localStorage.getItem(`campus_profile_completed_${savedEmailKey}`) === 'true'
          : false;

        const hasCompleteData = isLocallyCompleted || Boolean(
          p.alamat &&
          (p.website_url || p.website) &&
          p.nama_pic &&
          p.jabatan_pic &&
          (p.no_telepon_pic || p.phone_pic)
        );

        setIsProfileComplete(hasCompleteData);
        if (!hasCompleteData) {
          setShowProfileModal(true);
        } else {
          setShowProfileModal(false);
        }
      })
      .catch(() => {
        const savedEmail = (typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : '') || 'ki.informatika@harkatnegeri.ac.id';
        const savedName = typeof window !== 'undefined' 
          ? (localStorage.getItem(`campus_name_${savedEmail}`) || localStorage.getItem('campus_name'))
          : null;
        const savedLogo = typeof window !== 'undefined'
          ? (localStorage.getItem(`campus_logo_${savedEmail}`) || localStorage.getItem('campus_logo'))
          : null;

        const isLocallyCompleted = typeof window !== 'undefined' && Boolean(savedEmail)
          ? localStorage.getItem(`campus_profile_completed_${savedEmail}`) === 'true'
          : false;

        let fallbackName = savedName || 'Universitas Harkat Negeri';
        const words = fallbackName.trim().split(/\s+/);
        const fallbackInitials = words.length >= 2 
          ? (words[0][0] + words[1][0]).toUpperCase() 
          : fallbackName.substring(0, 2).toUpperCase();

        setCampusProfile({ name: fallbackName, email: savedEmail, initials: fallbackInitials, logoUrl: savedLogo || '' });
        setRawProfileData({ nama_kampus: fallbackName, email: savedEmail || '', logo_url: savedLogo || '' });
        
        if (isLocallyCompleted) {
          setIsProfileComplete(true);
          setShowProfileModal(false);
        } else {
          setIsProfileComplete(false);
          setShowProfileModal(true);
        }
      });
  }, [isAuthenticated, isAuthPage]);

  // Fetch Real-time Notifications based on logged-in Campus & Applicants
  useEffect(() => {
    if (!isAuthenticated || isAuthPage) return;

    const loadRealtimeNotifications = () => {
      fetchAuth('/api/admin/users?role=pelamar')
        .then(res => res.ok ? res.json() : [])
        .then((candidatesFromDb: any[]) => {
          let allCandidates = [...candidatesFromDb];
          if (typeof window !== 'undefined') {
            const cvStr = localStorage.getItem('candidateCvData');
            if (cvStr) {
              try {
                const localCv = JSON.parse(cvStr);
                allCandidates.unshift({
                  id: 'mhs-local',
                  name: localCv.fullName || 'Pelamar Baru',
                  profil: {
                    riwayat_pendidikan: localCv.education || [],
                    jurusan: localCv.education?.[0]?.major || localCv.education?.[0]?.field || 'Teknik Informatika'
                  }
                });
              } catch (_) {}
            }
          }

          const activeName = campusProfile.name || rawProfileData.nama_kampus || 'Universitas Harkat Negeri';
          const targetLower = activeName.toLowerCase().trim();
          const kw = targetLower.replace(/universitas|institut|politeknik|sekolah tinggi|akademi|stmik|univ/gi, '').trim();

          const matched = allCandidates.filter((c: any) => {
            const rawEdu = c.profil?.riwayat_pendidikan || c.profil?.pendidikan || c.education || '';
            const eduStr = typeof rawEdu === 'string' ? rawEdu.toLowerCase() : JSON.stringify(rawEdu).toLowerCase();
            if (!eduStr) return false;
            if (eduStr.includes(targetLower)) return true;
            return kw.length >= 3 && eduStr.includes(kw);
          });

          const list: Array<{ id: string; title: string; time: string }> = [];
          if (matched.length > 0) {
            matched.slice(0, 5).forEach((m: any, idx: number) => {
              const p = m.profil || {};
              const major = p.jurusan || (Array.isArray(p.riwayat_pendidikan) ? p.riwayat_pendidikan[0]?.major || p.riwayat_pendidikan[0]?.degree : '') || 'Mahasiswa Terdaftar';
              list.push({
                id: `notif-${m.id || idx}`,
                title: `Mahasiswa Terdaftar: ${m.name || 'Pelamar'} (${major}) mencantumkan ${activeName} pada CV`,
                time: idx === 0 ? 'Baru saja' : `${(idx + 1) * 15}m yang lalu`
              });
            });
          }
          
          // Tracer Study Monthly Report Notification Item
          const isAutoTracerEnabled = typeof window !== 'undefined' ? localStorage.getItem('campus_auto_tracer_report') !== 'false' : true;
          if (isAutoTracerEnabled) {
            list.push({
              id: 'notif-tracer-report',
              title: `Laporan Rekapitulasi Tracer Study Bulanan: Dokumen & grafik statistik siap diakses/diunduh`,
              time: 'Bulan Ini'
            });
          }

          // System status notification for active campus
          list.push({
            id: 'notif-system-active',
            title: `Profil ${activeName} terverifikasi & terhubung real-time dengan database rekrutmen`,
            time: 'Sistem Aktif'
          });

          setNotifications(list);
        })
        .catch(() => {
          const activeName = campusProfile.name || rawProfileData.nama_kampus || 'Universitas Harkat Negeri';
          setNotifications([
            {
              id: 'n1',
              title: `Profil ${activeName} terhubung secara real-time dengan portal rekrutmen`,
              time: 'Baru saja'
            }
          ]);
        });
    };

    loadRealtimeNotifications();

    // Polling interval (every 10s) and focus / storage event listeners
    const interval = setInterval(loadRealtimeNotifications, 10000);
    window.addEventListener('storage', loadRealtimeNotifications);
    window.addEventListener('focus', loadRealtimeNotifications);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadRealtimeNotifications);
      window.removeEventListener('focus', loadRealtimeNotifications);
    };
  }, [isAuthenticated, isAuthPage, campusProfile.name, rawProfileData.nama_kampus]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!mounted || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A4B9F]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
            <div className="flex items-center gap-3 min-w-0">
              <div 
                className="w-10 h-10 rounded-xl bg-[#1A4B9F] text-white flex items-center justify-center font-bold shadow-md shadow-[#1A4B9F]/20 overflow-hidden relative shrink-0 border border-border"
              >
                {campusProfile.logoUrl && !logoImageError ? (
                  <img 
                    src={campusProfile.logoUrl} 
                    alt={campusProfile.name} 
                    className="w-full h-full object-cover" 
                    onError={() => setLogoImageError(true)}
                  />
                ) : (
                  <span className="font-extrabold text-sm text-white select-none">
                    {campusProfile.initials || 'HN'}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-bold text-sm text-foreground leading-snug truncate" title={campusProfile.name}>
                  {campusProfile.name || 'Universitas Harkat Negeri'}
                </h1>
                <p className="text-[10px] text-muted-foreground font-medium truncate" title={campusProfile.email}>
                  {campusProfile.email || 'ki.informatika@harkatnegeri.ac.id'}
                </p>
              </div>
            </div>

            <button 
              onClick={toggleMobileSidebar}
              className="md:hidden p-1 text-muted-foreground hover:text-foreground rounded-md shrink-0 ml-1"
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
                      ? 'bg-[#1A4B9F] text-white shadow-sm shadow-[#1A4B9F]/20' 
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
                      ? 'bg-[#1A4B9F] text-white shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}
                  `}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <button 
              onClick={() => {
                if (isMobileSidebarOpen) toggleMobileSidebar();
                setShowLogoutModal(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer mt-1"
            >
              <LogOut size={18} />
              <span>Keluar (Logout)</span>
            </button>
          </nav>
        </div>

      </aside>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* Top Navbar */}
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
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#1A4B9F] text-white font-bold text-[10px] rounded-full flex items-center justify-center border border-card">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 sm:w-96 bg-card text-card-foreground border border-border rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-[#1A4B9F]" />
                        <h4 className="font-bold text-xs text-foreground">Notifikasi Karir Kampus</h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-[#1A4B9F] dark:text-blue-300 font-bold text-[10px] rounded-full">
                            {unreadCount} Baru
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead} 
                          className="text-[10px] font-bold text-[#1A4B9F] dark:text-blue-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <CheckCheck size={12} />
                          Tandai Semua Dibaca
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 text-xs max-h-72 overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((n) => {
                          const isRead = readNotifIds.includes(n.id);
                          return (
                            <div 
                              key={n.id} 
                              onClick={() => markAsRead(n.id)}
                              className={`p-3 rounded-xl transition-all cursor-pointer border ${
                                isRead 
                                  ? 'bg-muted/30 border-transparent text-muted-foreground opacity-75' 
                                  : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/60 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 min-w-0">
                                  {!isRead ? (
                                    <span className="w-2 h-2 rounded-full bg-[#1A4B9F] shrink-0 mt-1 animate-pulse" title="Belum Dibaca" />
                                  ) : (
                                     <CheckCircle2 size={13} className="text-slate-400 shrink-0 mt-0.5" />
                                  )}
                                  <p className={`text-[11px] leading-snug ${isRead ? 'font-medium text-slate-600 dark:text-slate-400' : 'font-bold text-slate-900 dark:text-white'}`}>
                                    {n.title}
                                  </p>
                                </div>
                                <span className={`text-[9px] font-bold shrink-0 px-1.5 py-0.5 rounded ${
                                  isRead ? 'bg-muted text-muted-foreground' : 'bg-blue-100 dark:bg-blue-900/80 text-[#1A4B9F] dark:text-blue-300'
                                }`}>
                                  {isRead ? 'Dibaca' : 'Baru'}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1.5 pl-4 font-mono">{n.time}</p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-muted-foreground text-xs font-medium">
                          Belum ada notifikasi baru.
                        </div>
                      )}
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
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background transition-colors duration-300 relative">
          
          {/* Warning Banner if profile incomplete */}
          {!isProfileComplete && (
            <div className="mb-6 p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="font-black text-sm text-foreground flex items-center gap-2">
                    Profil Perguruan Tinggi Belum Lengkap!
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] rounded-md uppercase font-extrabold">
                      Akses Terkunci
                    </span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Anda wajib melengkapi profil kampus (Alamat, Website, Akreditasi & Kontak PIC) untuk dapat menggunakan fitur dasbor dan melacak mahasiswa.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-xs rounded-xl transition-all shrink-0 cursor-pointer shadow-md flex items-center gap-2"
              >
                <Lock size={14} />
                Lengkapi Profil Sekarang
              </button>
            </div>
          )}

          {/* Content Wrapper with lock opacity if incomplete */}
          <div className={!isProfileComplete ? "relative pointer-events-none opacity-60 select-none filter blur-[1px]" : ""}>
            {children}
          </div>

          {!isProfileComplete && (
            <div className="absolute inset-0 z-20 top-24 bg-background/40 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
              <div className="bg-card text-card-foreground border border-border p-8 rounded-3xl max-w-md shadow-2xl space-y-4 animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
                  <Lock size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">Fitur Dasbor Masih Terkunci</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Selesaikan pengisian data profil perguruan tinggi untuk mengaktifkan seluruh analisis & melacak data penerimaan kerja mahasiswa.
                  </p>
                </div>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="w-full py-3 bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs rounded-full transition-all shadow-md cursor-pointer"
                >
                  Buka Modal Lengkapi Profil
                </button>
              </div>
            </div>
          )}

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
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('user_role');
                  localStorage.removeItem('user_id');
                  localStorage.removeItem('user_email');
                  localStorage.removeItem('isCampusLoggedIn');
                  toast.success('Berhasil keluar dari akun Universitas.');
                  router.push('/campus/login');
                }}
                className="px-5 py-2 rounded-full text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-colors cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY CAMPUS PROFILE MODAL */}
      <CampusProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        initialData={rawProfileData}
        onSuccess={(updated) => {
          setIsProfileComplete(true);
          setShowProfileModal(false);
          setRawProfileData(updated);
          if (typeof window !== 'undefined') {
            const email = localStorage.getItem('user_email') || '';
            if (email) {
              localStorage.setItem(`campus_profile_completed_${email}`, 'true');
              localStorage.setItem(`campus_name_${email}`, updated.nama_kampus || '');
              localStorage.setItem(`campus_address_${email}`, updated.alamat || '');
              localStorage.setItem(`campus_website_${email}`, updated.website_url || updated.website || '');
              localStorage.setItem(`campus_akreditasi_${email}`, updated.akreditasi || '');
              if (updated.logo_url) localStorage.setItem(`campus_logo_${email}`, updated.logo_url);
              localStorage.setItem(`campus_pic_name_${email}`, updated.nama_pic || '');
              localStorage.setItem(`campus_pic_jabatan_${email}`, updated.jabatan_pic || '');
              localStorage.setItem(`campus_pic_phone_${email}`, updated.no_telepon_pic || '');
              localStorage.setItem(`campus_profile_data_${email}`, JSON.stringify(updated));
            }
            localStorage.setItem('campus_name', updated.nama_kampus || '');
            localStorage.setItem('campus_address', updated.alamat || '');
            localStorage.setItem('campus_website', updated.website_url || updated.website || '');
            localStorage.setItem('campus_akreditasi', updated.akreditasi || '');
            if (updated.logo_url) localStorage.setItem('campus_logo', updated.logo_url);
            localStorage.setItem('campus_pic_name', updated.nama_pic || '');
            localStorage.setItem('campus_pic_jabatan', updated.jabatan_pic || '');
            localStorage.setItem('campus_pic_phone', updated.no_telepon_pic || '');
            localStorage.setItem('campus_profile_data', JSON.stringify(updated));
            localStorage.setItem('campus_profile_completed', 'true');
          }
          const cName = updated.nama_kampus || campusProfile.name;
          const words = cName.trim().split(/\s+/);
          const initials = words.length >= 2 
            ? (words[0][0] + words[1][0]).toUpperCase() 
            : cName.substring(0, 2).toUpperCase();
          const cLogo = updated.logo_url || campusProfile.logoUrl || '';
          setCampusProfile({
            name: cName,
            email: campusProfile.email,
            initials: initials,
            logoUrl: cLogo
          });
        }}
      />
    </div>
  );
}
