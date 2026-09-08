'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { getApiUrl, getMediaUrl } from '@/lib/api';
import Footer from '@/components/Footer';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Briefcase,
  ChevronLeft,
  Calendar,
  ExternalLink,
  Info,
  CheckCircle2,
  User,
  Menu,
  X,
  ArrowRight,
  Bookmark,
  ShieldCheck,
  ImageIcon,
  Sparkles,
  Heart
} from 'lucide-react';

interface JobItem {
  id: number | string;
  judul_posisi: string;
  kota?: string;
  lokasi_kerja?: string;
  tipe_pekerjaan?: string;
  experience_level?: string;
  pendidikan_min?: string;
  tampilkan_gaji?: boolean;
  gaji_min?: number;
  gaji_max?: number;
  created_at?: string;
}

interface CompanyProfile {
  id: number | string;
  nama_perusahaan: string;
  logo_url: string;
  industri: string;
  ukuran: string;
  website_url: string;
  deskripsi: string;
  alamat: string;
  kota: string;
  provinsi: string;
  tahun_berdiri: string;
  rating: number;
  jobs_count: number;
  verified_date?: string;
  jobs: JobItem[];
  galeri?: string[];
}

function extractCompanyRouteInfo(paramsObj: any): { rawId: string; realId: string; rawSlug: string } {
  if (!paramsObj) return { rawId: '', realId: '', rawSlug: '' };

  let parts: string[] = [];
  if (Array.isArray(paramsObj.slug)) {
    parts = paramsObj.slug;
  } else if (typeof paramsObj.slug === 'string') {
    parts = [paramsObj.slug];
  } else if (paramsObj.id) {
    parts = [paramsObj.id];
  }

  if (parts.length === 0) return { rawId: '', realId: '', rawSlug: '' };

  let rawSlug = parts[0] || '';
  let rawId = parts[parts.length - 1] || parts[0] || '';

  const uuidMatch = rawId.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
  let realId = uuidMatch ? uuidMatch[0] : (/^\d+/.test(rawId) ? rawId.split('-')[0] : rawId);

  return { rawId, realId, rawSlug };
}

const slugify = (text: string) => {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export default function GlintsCleanCompanyDetailPage({ params }: { params: Promise<{ slug?: string[]; id?: string }> }) {
  const resolvedParams = React.use(params);
  const { rawId, realId, rawSlug } = extractCompanyRouteInfo(resolvedParams);
  const router = useRouter();
  const pathname = usePathname();
  const isApplicantRoute = pathname?.startsWith('/applicant');

  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [similarCompanies, setSimilarCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('loker-pilihan');
  const [savedJobs, setSavedJobs] = useState<(number | string)[]>([]);

  const toggleSaveJob = (jobId: number | string) => {
    setSavedJobs(prev => prev.includes(jobId) ? prev.filter(i => i !== jobId) : [...prev, jobId]);
  };

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);

        const resAll = await fetch(getApiUrl('/perusahaan/verified'));
        let allCompsList: any[] = [];
        if (resAll.ok) {
          allCompsList = await resAll.json();
        }

        let foundMeta = Array.isArray(allCompsList)
          ? allCompsList.find((c: any) => {
            const compSlug = slugify(c.nama_perusahaan);
            return (
              String(c.id) === String(realId) ||
              String(c.id) === String(rawId) ||
              compSlug === rawSlug ||
              compSlug === rawId ||
              compSlug === realId
            );
          })
          : null;

        const targetId = foundMeta ? foundMeta.id : realId;

        let loadedCompany: CompanyProfile | null = null;
        if (targetId) {
          const resComp = await fetch(getApiUrl(`/perusahaan/${targetId}`));
          if (resComp.ok) {
            loadedCompany = await resComp.json();
          }
        }

        if (!loadedCompany && foundMeta) {
          loadedCompany = foundMeta;
        }

        if (loadedCompany) {
          if (loadedCompany.logo_url && !loadedCompany.logo_url.startsWith('http')) {
            loadedCompany.logo_url = getMediaUrl(loadedCompany.logo_url);
          }
          loadedCompany.verified_date = loadedCompany.verified_date || 'Terverifikasi Legalitas Mitra';
          loadedCompany.jobs = Array.isArray(loadedCompany.jobs) ? loadedCompany.jobs : [];
          loadedCompany.jobs_count = loadedCompany.jobs_count || loadedCompany.jobs.length;
          setCompany(loadedCompany);

          if (typeof window !== 'undefined' && loadedCompany.nama_perusahaan) {
            // Glints-style Document Title: "PT. Transafe Dharma Persada Karir & Profil Terbaru 2026 | AI-RecruitPro"
            document.title = `${loadedCompany.nama_perusahaan} Karir & Profil Terbaru 2026 | AI-RecruitPro`;

            // Glints-style Canonical URL: /companies/pt-transafe-dharma-persada/220b03a0-bcac-4d98-a8b0-28397916f80e
            const compSlug = slugify(loadedCompany.nama_perusahaan);
            if (compSlug && loadedCompany.id) {
              const canonicalPath = isApplicantRoute
                ? `/applicant/companies/${compSlug}/${loadedCompany.id}`
                : `/companies/${compSlug}/${loadedCompany.id}`;
              if (window.location.pathname !== canonicalPath) {
                window.history.replaceState(null, '', canonicalPath);
              }
            }
          }

          if (Array.isArray(allCompsList) && allCompsList.length > 0) {
            let similar = allCompsList.filter(
              (c: any) => String(c.id) !== String(loadedCompany?.id) && c.industri === loadedCompany?.industri
            );
            if (similar.length === 0) {
              similar = allCompsList.filter((c: any) => String(c.id) !== String(loadedCompany?.id));
            }
            similar = similar.slice(0, 4);
            similar.forEach((c: any) => {
              if (c.logo_url && !c.logo_url.startsWith('http')) {
                c.logo_url = getMediaUrl(c.logo_url);
              }
            });
            setSimilarCompanies(similar);
          }
        } else {
          setCompany(null);
        }
      } catch (err) {
        console.error('Failed to fetch company profile:', err);
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    if (rawId) {
      fetchCompany();
    }
  }, [rawId, realId]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    const element = document.getElementById(tabId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-transparent">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A4B9F]"></div>
        <p className="mt-4 text-slate-500 font-semibold animate-pulse text-sm">Memuat profil perusahaan...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <Building2 size={56} className="text-slate-300 dark:text-slate-700 mb-3" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Profil Perusahaan Tidak Ditemukan</h2>
        <p className="text-slate-500 font-medium text-xs max-w-md">Profil perusahaan ini mungkin belum terverifikasi atau informasi tidak tersedia saat ini.</p>
        <button
          onClick={() => router.push(isApplicantRoute ? '/applicant/dashboard?view=companies' : '/companies')}
          className="px-5 py-2.5 rounded-full bg-[#1A4B9F] text-white text-xs font-bold hover:bg-[#133A7A] transition-colors mt-5"
        >
          Lihat Semua Perusahaan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#1A4B9F] selection:text-white transition-colors">

      {/* -------------------- TOP NAVBAR (ONLY IF NOT IN APPLICANT ROUTE) -------------------- */}
      {!isApplicantRoute && (
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/Logo Ai Recruit Pro..png"
                alt="AI-RecruitPro Logo"
                width={70}
                height={70}
                className="h-13 sm:h-15 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
                priority
              />
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
                AI-RecruitPro
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-900 dark:text-slate-200">
              <Link href="/#job-feed-section" className="hover:text-[#1A4B9F] transition-colors">
                Lowongan Terbaru
              </Link>
              <Link href="/#categories-section" className="hover:text-[#1A4B9F] transition-colors">
                Kategori Pekerjaan
              </Link>
              <Link href="/companies" className="text-[#1A4B9F] font-bold relative after:content-[''] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F]">
                Perusahaan
              </Link>
              <Link href="/#success-stories" className="hover:text-[#1A4B9F] transition-colors">
                Kisah Sukses
              </Link>
            </nav>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <Link
                href="/perusahaan/login"
                className="hidden sm:inline-flex px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all items-center gap-1.5 border border-slate-200 dark:border-slate-700"
              >
                <Building2 size={14} />
                <span>Untuk Perusahaan</span>
              </Link>

              <Link
                href="/applicant/login"
                className="hidden sm:inline-flex px-4 py-2 bg-[#1A4B9F] hover:bg-[#133878] text-white text-xs font-bold rounded-xl transition-all items-center gap-1.5 shadow-2xs"
              >
                <User size={14} />
                <span>Masuk Pelamar</span>
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-200"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Nav Overlay */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg px-6 py-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              <Link href="/#job-feed-section" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
                Lowongan Terbaru
              </Link>
              <Link href="/#categories-section" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
                Kategori Pekerjaan
              </Link>
              <Link href="/companies" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
                Perusahaan
              </Link>
              <Link href="/#success-stories" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 dark:text-slate-200 font-bold py-2 border-t border-slate-100 dark:border-slate-800">
                Kisah Sukses
              </Link>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2.5 sm:hidden">
                <Link
                  href="/applicant/login"
                  className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold border border-slate-200 dark:border-slate-700"
                >
                  <User size={16} />
                  <span>Masuk</span>
                </Link>
                <Link
                  href="/perusahaan/login"
                  className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1A4B9F] hover:bg-[#133878] text-white text-sm font-bold shadow-sm"
                >
                  <Building2 size={16} />
                  <span>Untuk Perusahaan</span>
                </Link>
              </div>
            </div>
          )}
        </header>
      )}

      {/* -------------------- COMPANY HEADER CARD SECTION -------------------- */}
      <div className={isApplicantRoute ? "w-full max-w-[1400px] mx-auto space-y-6" : ""}>

        {/* Google-style Clean Breadcrumbs Navigation */}
        <div className={isApplicantRoute ? "px-1" : "max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-16 pt-6"}>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-[#1A4B9F] dark:hover:text-blue-400 transition-colors">
              Beranda
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <Link href={isApplicantRoute ? "/applicant/companies" : "/companies"} className="hover:text-[#1A4B9F] dark:hover:text-blue-400 transition-colors">
              Perusahaan
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-slate-900 dark:text-white font-bold truncate max-w-[200px] sm:max-w-md">
              {company.nama_perusahaan}
            </span>
          </nav>
        </div>

        <section className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors ${isApplicantRoute ? "rounded-2xl p-6 sm:p-8 shadow-2xs" : "border-b py-10 px-6 sm:px-10 lg:px-16"
          }`}>
          <div className={isApplicantRoute ? "w-full" : "max-w-[1300px] mx-auto"}>

            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">

              {/* Left: Logo & Company Key Information */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">

                {/* Company Logo Box */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.nama_perusahaan}
                      className="max-w-full max-h-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-[#1A4B9F] dark:text-blue-400">
                      <Building2 size={40} />
                    </div>
                  )}
                </div>

                {/* Company Name & Metadata */}
                <div className="space-y-2.5 pt-1">

                  {/* Company Name & Verified Icon */}
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {company.nama_perusahaan}
                    </h1>
                    <span title="Terverifikasi Legalitas Mitra">
                      <ShieldCheck size={22} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <MapPin size={16} className="text-slate-400 shrink-0" />
                    <span>{company.kota ? `${company.kota}, ${company.provinsi || 'Indonesia'}` : company.alamat || 'Indonesia'}</span>
                  </div>

                  {/* Industry */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <Building2 size={16} className="text-slate-400 shrink-0" />
                    <span>{company.industri || 'Teknologi & Informasi'}</span>
                  </div>

                </div>
              </div>

              {/* Right: Employee Size & Verification Badge */}
              <div className="space-y-2.5 text-center md:text-left border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-1">

                {/* Employee Count */}
                <div className="flex items-center justify-center md:justify-start gap-2.5 text-sm text-slate-800 dark:text-slate-200 font-semibold">
                  <Users size={16} className="text-slate-500 shrink-0" />
                  <span>{company.ukuran || '50+ karyawan'}</span>
                </div>

                {/* Verified Status */}
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <ShieldCheck size={16} className="text-[#1A4B9F] shrink-0" />
                  <span>{company.verified_date || 'Terverifikasi Legalitas Mitra'}</span>
                  <span title="Informasi Verifikasi Legalitas">
                    <Info size={14} className="text-slate-400 cursor-pointer hover:text-slate-600" />
                  </span>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* -------------------- STICKY SUB-TABS BAR -------------------- */}
        <div className={`sticky ${isApplicantRoute ? 'top-20' : 'top-20'} z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs transition-colors my-4`}>
          <div className="max-w-[1300px] mx-auto px-4 sm:px-6 flex items-center gap-6 sm:gap-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { id: 'loker-pilihan', label: `Lowongan (${company.jobs?.length || 0})` },
              { id: 'deskripsi', label: 'Deskripsi' },
              { id: 'kultur', label: 'Kultur Perusahaan' },
              { id: 'hubungi-kami', label: 'Alamat & Kontak' },
              { id: 'galeri', label: 'Galeri' },
              { id: 'perusahaan-lainnya', label: 'Perusahaan Lainnya' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`py-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors relative cursor-pointer ${activeTab === tab.id
                  ? 'text-[#1A4B9F] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-[#1A4B9F] dark:after:bg-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#1A4B9F] dark:hover:text-blue-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* -------------------- MAIN CONTENT SECTIONS -------------------- */}
        <main className={`py-4 space-y-8 flex-1 w-full ${isApplicantRoute ? "w-full" : "max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-16"}`}>

          {/* -------------------- SECTION 1: LOKER PILIHAN -------------------- */}
          <section id="loker-pilihan" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lowongan Kerja</h2>
            </div>

            {(!company.jobs || company.jobs.length === 0) ? (
              <div className="p-8 text-center space-y-2">
                <Briefcase size={36} className="text-slate-300 mx-auto" />
                <p className="text-slate-600 dark:text-slate-400 font-semibold text-sm">Saat ini belum ada lowongan pekerjaan aktif dari perusahaan ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {company.jobs.map((job: JobItem, idx: number) => {
                  const isSaved = savedJobs.includes(job.id);
                  const workTypeLabel = job.lokasi_kerja === 'remote' ? 'Remote/Dari rumah' : job.lokasi_kerja === 'hybrid' ? 'Hybrid' : 'On-site';
                  const empTypeLabel = job.tipe_pekerjaan ? job.tipe_pekerjaan.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Full Time';
                  const salaryLabel = (job.tampilkan_gaji && job.gaji_min && job.gaji_max)
                    ? `Rp ${(job.gaji_min / 1000000).toFixed(0)} - ${(job.gaji_max / 1000000).toFixed(0)}jt`
                    : 'Gaji Dirahasiakan';

                  return (
                    <div
                      key={idx}
                      onClick={() => router.push(isApplicantRoute ? `/applicant/dashboard` : '/applicant/login')}
                      className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:shadow-lg hover:border-[#1A4B9F] transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
                    >
                      <div className="space-y-3">

                        {/* Header Title + Salary */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-[#1A4B9F] transition-colors leading-snug line-clamp-2">
                            {job.judul_posisi}
                          </h3>
                          <span className="text-xs font-bold text-[#1A4B9F] dark:text-blue-400 shrink-0 bg-[#E8F1FC] dark:bg-blue-950 px-2.5 py-1 rounded-md">
                            {salaryLabel}
                          </span>
                        </div>

                        {/* Tag Pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                            {workTypeLabel}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                            {empTypeLabel}
                          </span>
                          {job.experience_level && (
                            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                              {job.experience_level}
                            </span>
                          )}
                        </div>

                        {/* Sub Company Logo & Location */}
                        <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Building2 size={15} className="text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-white">{company.nama_perusahaan}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin size={14} className="text-slate-400 shrink-0" />
                          <span>{job.kota || company.kota || 'Indonesia'}</span>
                        </div>

                      </div>

                      {/* Card Bottom Bar */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Baru Diterbitkan</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
                          className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isSaved ? 'text-[#1A4B9F] fill-current' : 'text-slate-400'
                            }`}
                        >
                          <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* -------------------- SECTION 2: DESKRIPSI PERUSAHAAN -------------------- */}
          <section id="deskripsi" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">Deskripsi Perusahaan</h2>
            <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed font-normal whitespace-pre-wrap">
              {company.deskripsi || 'Perusahaan terverifikasi mitra AI-RecruitPro yang berkomitmen menghadirkan lingkungan kerja transparan dan profesional.'}
            </p>
          </section>

          {/* -------------------- SECTION 3: KULTUR PERUSAHAAN -------------------- */}
          <section id="kultur" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">Kultur & Manfaat Perusahaan</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <Sparkles className="text-[#1A4B9F] dark:text-blue-400" size={24} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Fleksibilitas Kerja</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Dukungan sistem kerja transparan dan profesional.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <Heart className="text-[#1A4B9F] dark:text-blue-400" size={24} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Asuransi Kesehatan</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Perlindungan kesehatan bagi anggota tim terdaftar.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <Briefcase className="text-[#1A4B9F] dark:text-blue-400" size={24} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pengembangan Karir</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Peluang peningkatan jalur karir dan sertifikasi keahlian.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <Users className="text-[#1A4B9F] dark:text-blue-400" size={24} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Tim Kolaboratif</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Lingkungan kerja inovatif, ramah, dan saling mendukung.</p>
              </div>
            </div>
          </section>

          {/* -------------------- SECTION 4: HUBUNGI KAMI -------------------- */}
          <section id="hubungi-kami" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">Hubungi Kami & Alamat</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin size={18} className="text-[#1A4B9F]" /> Alamat Kantor Resmi
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {company.alamat ? `${company.alamat}, ${company.kota || ''}, ${company.provinsi || ''}` : `${company.kota || 'Indonesia'}`}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe size={18} className="text-[#1A4B9F]" /> Website & Media Sosial
                </h3>
                {company.website_url ? (
                  <a
                    href={company.website_url.startsWith('http') ? company.website_url : `https://${company.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#1A4B9F] hover:underline"
                  >
                    {company.website_url} <ExternalLink size={14} />
                  </a>
                ) : (
                  <span className="text-sm text-slate-500 font-medium">Situs resmi dalam proses verifikasi</span>
                )}
              </div>
            </div>
          </section>

          {/* -------------------- SECTION 5: GALERI -------------------- */}
          <section id="galeri" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center gap-2">
              <ImageIcon size={22} className="text-[#1A4B9F]" /> Galeri Perusahaan
            </h2>

            {company.galeri && company.galeri.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {company.galeri.map((imgSrc, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100">
                    <img src={imgSrc} alt="Galeri Lingkungan Kerja" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 font-medium text-sm">Galeri foto lingkungan kerja belum diunggah oleh perusahaan ini.</p>
            )}
          </section>

          {/* -------------------- SECTION 7: PERUSAHAAN LAINNYA -------------------- */}
          {similarCompanies.length > 0 && (
            <section id="perusahaan-lainnya" className="space-y-6 pt-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Perusahaan Lainnya</h2>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {similarCompanies.map((comp) => {
                  const compSlug = slugify(comp.nama_perusahaan);
                  const targetUrl = isApplicantRoute
                    ? `/applicant/companies/${compSlug}/${comp.id}`
                    : `/companies/${compSlug}/${comp.id}`;

                  return (
                    <div
                      key={comp.id}
                      onClick={() => router.push(targetUrl)}
                      className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xl hover:border-[#1A4B9F] transition-all cursor-pointer flex flex-col items-center text-center group"
                    >
                      {comp.logo_url ? (
                        <img
                          src={comp.logo_url}
                          alt={comp.nama_perusahaan}
                          className="w-16 h-16 rounded-xl object-contain border border-slate-200 dark:border-slate-700 mb-3 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 mb-3 flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 group-hover:scale-105 transition-transform">
                          <Building2 size={24} />
                        </div>
                      )}
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#1A4B9F] transition-colors mb-1 line-clamp-1">
                        {comp.nama_perusahaan}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mb-3">{comp.industri}</p>
                      <div className="w-full mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-[#1A4B9F] group-hover:underline">
                          {comp.jobs_count || 0} Lowongan Aktif
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </main>
      </div>

      {/* -------------------- FOOTER (ONLY IF NOT IN APPLICANT ROUTE) -------------------- */}
      {!isApplicantRoute && <Footer />}

    </div>
  );
}
