'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Bookmark,
  Search,
  MapPin,
  GraduationCap,
  Briefcase,
  DollarSign,
  Trash2,
  Send,
  CheckCircle2,
  ChevronRight,
  X,
  Clock
} from 'lucide-react';
import { api, getMediaUrl } from '@/lib/api';

interface SavedJob {
  id: number;
  title: string;
  company: string;
  logo: string;
  location: string;
  education: string;
  educationLevel: string;
  experienceLevel: string;
  openingsCount: number;
  benefits: string[];
  workPolicy: string;
  salary: string;
  postedAgo: string;
  publishDate: string;
  applicationDeadline?: string | null;
  isPromoted?: boolean;
  isNew?: boolean;
  matchScore: number;
  reason: string;
  descriptionBullets: string[];
  responsibilitiesBullets: string[];
  placementInfo: string;
  criteriaBullets: string[];
  savedAt: string;
}

function SavedJobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('keyword') || '');
  const [policyFilter, setPolicyFilter] = useState(searchParams.get('policy') || 'Semua');

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'Semua' && value !== 'All') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const [cvDetails, setCvDetails] = useState<any>(null);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [activeJobModal, setActiveJobModal] = useState<SavedJob | null>(null);
  const [masterJobs, setMasterJobs] = useState<SavedJob[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<any[]>([]);

  useEffect(() => {
    // Load candidate CV data
    const savedCv = localStorage.getItem('candidateCvData');
    if (savedCv) {
      try { setCvDetails(JSON.parse(savedCv)); } catch (e) { }
    }

    // Load applied jobs
    const savedApplied = localStorage.getItem('appliedJobsList');
    if (savedApplied) {
      try { setAppliedJobs(JSON.parse(savedApplied)); } catch (e) { }
    }

    // Load saved job IDs from localStorage
    const storedSavedIds = localStorage.getItem('candidateSavedJobsList');
    if (storedSavedIds) {
      try {
        setSavedJobIds(JSON.parse(storedSavedIds));
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch real jobs to populate masterJobs
    const fetchRealData = async () => {
      try {
        // 1. Fetch saved jobs from backend API if available
        try {
          const resSaved = await api.get('/saved-jobs/');
          if (resSaved && Array.isArray(resSaved)) {
            const backendSavedIds = resSaved.map((s: any) => s.id);
            if (backendSavedIds.length > 0) {
              setSavedJobIds((prev) => Array.from(new Set([...prev, ...backendSavedIds])));
            }
          }
        } catch (e) { }

        const apiParams = new URLSearchParams();
        const kw = searchParams.get('keyword');
        const policy = searchParams.get('policy');
        if (kw) apiParams.append('keyword', kw);
        if (policy && policy !== 'Semua') apiParams.append('tipe_pekerjaan', policy);
        const qs = apiParams.toString();

        // 2. Fetch all jobs from backend API
        const resJobs = await api.get(qs ? `/jobs/?${qs}` : '/jobs/');
        const rawJobsList = Array.isArray(resJobs) ? resJobs : (resJobs?.data && Array.isArray(resJobs.data) ? resJobs.data : []);

        if (rawJobsList.length > 0) {
          const safeParseArray = (val: any) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            try {
              const parsed = JSON.parse(val);
              return Array.isArray(parsed) ? parsed : [val];
            } catch {
              return typeof val === 'string'
                ? val.split('\n').map((s: string) => s.trim()).filter(Boolean)
                : [val];
            }
          };

          const mapped = rawJobsList.map((j: any) => {
            const benefitsArray = safeParseArray(j.benefits_json || j.benefit);
            const expVal = j.experience_level || j.pengalaman_min_tahun || j.pengalaman_min;
            const expLevel = (() => {
              if (expVal === 'Entry Level') return 'Entry Level (0 - 1 Tahun)';
              if (expVal === 'Mid Level') return 'Mid Level (2 - 4 Tahun)';
              if (expVal === 'Senior Level') return 'Senior Level (5+ Tahun)';
              if (expVal === 'Lead / Manager') return 'Lead / Manager (8+ Tahun)';
              if (typeof expVal === 'number') {
                if (expVal === 0) return 'Fresh Graduate';
                if (expVal <= 1) return language === 'id' ? '< 1 Tahun' : '< 1 Year';
                if (expVal <= 3) return language === 'id' ? `${expVal} Tahun` : `${expVal} Years`;
                return language === 'id' ? `> ${expVal} Tahun` : `> ${expVal} Years`;
              }
              return expVal || (language === 'id' ? 'Semua Pengalaman' : 'Any Experience');
            })();

            const createdDate = j.tanggal_buka ? new Date(j.tanggal_buka) : (j.created_at ? new Date(j.created_at) : new Date());
            const now = new Date();
            const createdStartOfDay = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
            const nowStartOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const diffDays = Math.floor((nowStartOfDay.getTime() - createdStartOfDay.getTime()) / (1000 * 60 * 60 * 24));

            const postedAgoText = (() => {
              if (diffDays <= 0) return language === 'id' ? 'Hari ini' : 'Today';
              if (diffDays === 1) return language === 'id' ? '1 hari yang lalu' : '1 day ago';
              return language === 'id' ? `${diffDays} hari yang lalu` : `${diffDays} days ago`;
            })();
            const isNewJob = diffDays >= 0 && diffDays <= 7;

            return {
              id: j.id,
              title: j.judul_posisi,
              company: j.perusahaan?.nama_perusahaan || (language === 'id' ? 'Perusahaan' : 'Company'),
              logo: (j.perusahaan?.logo_url && j.perusahaan.logo_url !== '')
                ? getMediaUrl(j.perusahaan.logo_url)
                : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
              location: j.kota || (j.perusahaan?.kota ? j.perusahaan.kota : 'Remote'),
              education: j.pendidikan_min || safeParseArray(j.kualifikasi)[0] || (language === 'id' ? 'Terbuka untuk umum' : 'Open to public'),
              educationLevel: j.pendidikan_min || 'SMA/SMK/D3/S1',
              experienceLevel: expLevel,
              openingsCount: j.openings_count || 1,
              benefits: benefitsArray,
              workPolicy: (() => {
                const type = j.tipe_pekerjaan ? j.tipe_pekerjaan.split('_').map((w: any) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Full Time';
                const loc = j.lokasi_kerja === 'remote' ? 'Remote (WFH)' : j.lokasi_kerja === 'hybrid' ? 'Hybrid' : 'On-site';
                return `${type} (${loc})`;
              })(),
              salary: (j.tampilkan_gaji && j.gaji_min && j.gaji_max) ? `Rp ${(j.gaji_min / 1000000).toFixed(0)} Jt - Rp ${(j.gaji_max / 1000000).toFixed(0)} Jt` : (language === 'id' ? 'Gaji Dirahasiakan' : 'Salary Undisclosed'),
              postedAgo: postedAgoText,
              publishDate: createdDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
              applicationDeadline: j.tanggal_tutup ? new Date(j.tanggal_tutup).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null,
              isPromoted: j.is_promoted || false,
              isNew: isNewJob,
              matchScore: j.match_score || 92,
              reason: j.reason || (language === 'id' ? 'Keahlian & kualifikasi Anda sesuai dengan posisi ini.' : 'Your skills and qualifications match this role.'),
              descriptionBullets: safeParseArray(j.deskripsi_pekerjaan),
              responsibilitiesBullets: safeParseArray(j.tanggung_jawab),
              placementInfo: j.kota ? (language === 'id' ? `Untuk lokasi di ${j.kota}` : `Located in ${j.kota}`) : (j.lokasi_kerja === 'remote' ? (language === 'id' ? 'Remote (Kerja Dari Mana Saja)' : 'Remote (Work From Anywhere)') : (language === 'id' ? 'Lokasi Perusahaan' : 'Company Location')),
              criteriaBullets: safeParseArray(j.kualifikasi),
              savedAt: j.tanggal_buka ? new Date(j.tanggal_buka).toLocaleDateString('id-ID') : (language === 'id' ? 'Terbaru' : 'Newest')
            };
          });
          setMasterJobs(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch master jobs:', err);
      }
    };
    fetchRealData();
  }, [searchParams]);

  // Remove saved job
  const handleRemoveSaved = async (jobId: any) => {
    const newSaved = savedJobIds.filter((id) => String(id) !== String(jobId));
    setSavedJobIds(newSaved);
    localStorage.setItem('candidateSavedJobsList', JSON.stringify(newSaved));
    try {
      await api.delete(`/saved-jobs/${jobId}`);
    } catch (err) { }
  };

  // Clear all saved jobs
  const handleClearAllSaved = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua lowongan tersimpan?')) {
      setSavedJobIds([]);
      localStorage.setItem('candidateSavedJobsList', JSON.stringify([]));
    }
  };

  // Direct Apply Handler
  const handleApplyWithCv = (jobId: any, companyName: string, title: string) => {
    const newApplied = [...appliedJobs, jobId];
    setAppliedJobs(newApplied);
    localStorage.setItem('appliedJobsList', JSON.stringify(newApplied));

    alert(language === 'id'
      ? `🎉 Sukses! CV Anda ("${cvDetails?.fullName || 'Pelamar'}") telah terkirim ke HR ${companyName} untuk posisi "${title}".`
      : `🎉 Success! Your ATS-Friendly CV ("${cvDetails?.fullName || 'Applicant'}") has been sent to ${companyName} HR for the "${title}" position.`);
    router.push('/applicant/status');
  };

  // Filter saved jobs list
  const visibleSavedJobs = useMemo(() => {
    const savedIdsSet = new Set(savedJobIds.map((id) => String(id)));
    const resultList: SavedJob[] = [];

    savedIdsSet.forEach((idStr) => {
      const master = masterJobs.find((m) => String(m.id) === idStr);
      if (master) {
        resultList.push(master);
      }
    });

    return resultList.filter((job) => {
      const activeKeyword = searchParams.get('keyword') || '';
      const matchesQuery =
        !activeKeyword ||
        job.title.toLowerCase().includes(activeKeyword.toLowerCase()) ||
        job.company.toLowerCase().includes(activeKeyword.toLowerCase()) ||
        job.location.toLowerCase().includes(activeKeyword.toLowerCase());

      const policyLower = job.workPolicy ? job.workPolicy.toLowerCase() : '';
      const activePolicy = searchParams.get('policy') || 'Semua';
      const filterLower = activePolicy.toLowerCase();
      const matchesPolicy =
        activePolicy === 'Semua' ||
        policyLower.includes(filterLower) ||
        (activePolicy === 'Remote' && (policyLower.includes('wfh') || policyLower.includes('remote')));

      return matchesQuery && matchesPolicy;
    });
  }, [masterJobs, savedJobIds, searchParams]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-[1600px] mx-auto">

      {/* HEADER BANNER */}
      <div className="bg-[#1A4B9F] rounded-2xl p-4 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="space-y-1 sm:space-y-2 relative z-10">
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">
            {t.pelamar.tersimpan.title}
          </h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {t.pelamar.tersimpan.subtitle}
          </p>
        </div>

        {/* Counter Badge */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-5 rounded-xl sm:rounded-2xl shrink-0 flex sm:flex-col items-center justify-between sm:justify-center gap-2 sm:gap-1 text-left sm:text-center w-full sm:w-auto">
          <span className="text-2xl sm:text-3xl font-black text-white leading-none">{visibleSavedJobs.length}</span>
          <span className="text-xs font-bold text-blue-100">{language === 'id' ? 'Total Lowongan Tersimpan' : 'Total Saved Jobs'}</span>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">

          <form
            className="flex items-center gap-2 w-full sm:w-auto flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              updateUrlParams({ keyword: searchQuery, policy: policyFilter });
            }}
          >
            <div className="relative flex-1 sm:w-80 flex items-center">
              <Search className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'id' ? "Cari lowongan tersimpan..." : "Search saved jobs..."}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#1A4B9F]"
              />
            </div>

            <button
              type="submit"
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-sm flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{language === 'id' ? 'Cari' : 'Search'}</span>
            </button>
          </form>

          {/* Clear All */}
          {visibleSavedJobs.length > 0 && (
            <div className="flex items-center justify-end sm:justify-start">
              <button
                type="button"
                onClick={handleClearAllSaved}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>{language === 'id' ? 'Hapus Semua' : 'Clear All'}</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* SAVED JOBS LIST GRID */}
      {visibleSavedJobs.length === 0 ? (
        /* EMPTY STATE CARD */
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-12 text-center border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 max-w-2xl mx-auto my-6 sm:my-12">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#EFF6FF] dark:bg-slate-800 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
            <Bookmark className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white">
              {t.pelamar.tersimpan.noSavedJobs}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {language === 'id' ? 'Jelajahi berbagai posisi lowongan kerja terbaik di halaman Cari Lowongan dan simpan lowongan favorit Anda.' : 'Explore the best job openings on the Search Jobs page and save your favorite listings.'}
            </p>
          </div>
          <Link
            href="/applicant/dashboard"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            <span>{t.pelamar.tersimpan.startSearching}</span>
          </Link>
        </div>
      ) : (
        /* CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {visibleSavedJobs.map((job) => {
            const isApplied = appliedJobs.includes(job.id);

            return (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-2xs hover:shadow-md hover:border-[#1A4B9F]/40 transition-all flex flex-col justify-between space-y-4 sm:space-y-5 relative group"
              >
                {/* Top Company & Title */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={job.logo}
                        alt={job.company}
                        className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z'/%3E%3Cpath d='M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2'/%3E%3Cpath d='M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2'/%3E%3Cpath d='M10 6h4'/%3E%3Cpath d='M10 10h4'/%3E%3Cpath d='M10 14h4'/%3E%3Cpath d='M10 18h4'/%3E%3C/svg%3E";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => setActiveJobModal(job)}
                          className="text-left font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-[#1A4B9F] dark:group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-1 block w-full"
                        >
                          {job.title}
                        </button>
                        <p className="text-xs font-bold text-[#1A4B9F] dark:text-blue-400 truncate">
                          {job.company}
                        </p>
                      </div>
                    </div>

                    {/* Unsave Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveSaved(job.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                      title={language === 'id' ? "Hapus dari simpanan" : "Remove from saved"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Bullet Infos in clean 2-column grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium pt-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin size={13} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Briefcase size={13} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                      <span className="truncate">{job.workPolicy}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <GraduationCap size={13} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                      <span className="truncate">{job.education}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <DollarSign size={13} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                      <span className="font-extrabold text-slate-800 dark:text-white truncate">{job.salary}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">{language === 'id' ? 'Disimpan pada:' : 'Saved on:'} {job.savedAt}</span>
                    <button
                      type="button"
                      onClick={() => setActiveJobModal(job)}
                      className="font-bold text-[#1A4B9F] dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-0.5 shrink-0"
                    >
                      <span>{language === 'id' ? 'Detail' : 'Details'}</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  {isApplied ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 size={16} /> {language === 'id' ? 'Lamaran & CV Terkirim' : 'Application & CV Sent'}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyWithCv(job.id, job.company, job.title)}
                      className="w-full py-2.5 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] text-white font-extrabold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send size={15} />
                      <span>{t.pelamar.tersimpan.applyNow}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* JOB DETAIL MODAL (Matching Cari Lowongan Detail View 100%) */}
      {activeJobModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] flex flex-col overflow-hidden">

            {/* Detail Header */}
            <div className="shrink-0 p-4 sm:p-6 pb-3 sm:pb-4 space-y-3 sm:space-y-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <img
                    src={activeJobModal.logo}
                    alt={activeJobModal.company}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z'/%3E%3Cpath d='M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2'/%3E%3Cpath d='M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2'/%3E%3Cpath d='M10 6h4'/%3E%3Cpath d='M10 10h4'/%3E%3Cpath d='M10 14h4'/%3E%3Cpath d='M10 18h4'/%3E%3C/svg%3E";
                    }}
                  />
                  <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-extrabold text-[#1A4B9F] dark:text-blue-400 truncate max-w-[200px]">{activeJobModal.company}</span>
                      {activeJobModal.isNew && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] border border-amber-200">{language === 'id' ? 'Loker Terbaru' : 'New Job'}</span>
                      )}
                      {activeJobModal.isPromoted && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-extrabold text-[10px]">{language === 'id' ? 'Dipromosikan' : 'Promoted'}</span>
                      )}
                    </div>
                    <h3 className="font-black text-base sm:text-xl text-slate-900 dark:text-white leading-tight">{activeJobModal.title}</h3>
                    {activeJobModal.openingsCount > 0 && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-slate-800 text-[#1A4B9F] dark:text-blue-400 text-[11px] font-bold border border-[#DBEAFE] dark:border-slate-700">
                        {language === 'id' ? 'Kuota Terbuka:' : 'Openings:'} {activeJobModal.openingsCount} {language === 'id' ? 'Posisi' : 'Positions'}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setActiveJobModal(null)} className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0">
                  <X size={18} />
                </button>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <div className="flex items-center gap-2 p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <MapPin size={14} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                  <div className="min-w-0"><p className="text-[10px] text-slate-400 uppercase font-bold">{language === 'id' ? 'Lokasi' : 'Location'}</p><p className="font-extrabold truncate">{activeJobModal.location}</p></div>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <GraduationCap size={14} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                  <div className="min-w-0"><p className="text-[10px] text-slate-400 uppercase font-bold">{language === 'id' ? 'Min. Pendidikan' : 'Min. Education'}</p><p className="font-extrabold truncate">{activeJobModal.educationLevel}</p></div>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <Briefcase size={14} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                  <div className="min-w-0"><p className="text-[10px] text-slate-400 uppercase font-bold">{language === 'id' ? 'Tipe Kerja' : 'Work Type'}</p><p className="font-extrabold truncate">{activeJobModal.workPolicy}</p></div>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <DollarSign size={14} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                  <div className="min-w-0"><p className="text-[10px] text-slate-400 uppercase font-bold">{language === 'id' ? 'Gaji' : 'Salary'}</p><p className="font-black text-[#1A4B9F] dark:text-blue-400 truncate">{activeJobModal.salary}</p></div>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <Clock size={14} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                  <div className="min-w-0"><p className="text-[10px] text-slate-400 uppercase font-bold">{language === 'id' ? 'Batas Lamaran' : 'Deadline'}</p><p className="font-extrabold truncate">{activeJobModal.applicationDeadline || (language === 'id' ? 'Tidak ditentukan' : 'Not specified')}</p></div>
                </div>
                <div className="flex items-center gap-2 p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <CheckCircle2 size={14} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                  <div className="min-w-0"><p className="text-[10px] text-slate-400 uppercase font-bold">{language === 'id' ? 'Pengalaman' : 'Experience'}</p><p className="font-extrabold truncate">{activeJobModal.experienceLevel}</p></div>
                </div>
              </div>

              {/* Benefits */}
              {activeJobModal.benefits && activeJobModal.benefits.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{language === 'id' ? 'Fasilitas & Benefit:' : 'Facilities & Benefits:'}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeJobModal.benefits.map((b, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] dark:bg-slate-800 text-[#1A4B9F] dark:text-blue-400 text-[11px] font-bold border border-[#DBEAFE] dark:border-slate-700">✓ {b}</span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 font-bold italic">
                {language === 'id' ? 'Diterbitkan:' : 'Published:'} {activeJobModal.publishDate} • {activeJobModal.postedAgo}
              </p>
            </div>

            {/* Scrollable Description Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Deskripsi */}
              <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">{language === 'id' ? 'Gambaran Umum & Deskripsi Pekerjaan' : 'Job Overview & Description'}</h4>
                <ul className="space-y-1.5 list-disc pl-5">
                  {activeJobModal.descriptionBullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>

              {/* Tanggung Jawab */}
              {activeJobModal.responsibilitiesBullets && activeJobModal.responsibilitiesBullets.length > 0 && (
                <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">{language === 'id' ? 'Tanggung Jawab Utama' : 'Key Responsibilities'}</h4>
                  <ul className="space-y-1.5 list-disc pl-5 font-semibold">
                    {activeJobModal.responsibilitiesBullets.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              {/* Kualifikasi */}
              <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">{language === 'id' ? 'Kualifikasi & Persyaratan' : 'Qualifications & Requirements'}</h4>
                <ul className="space-y-1.5 list-disc pl-5 font-semibold">
                  {activeJobModal.criteriaBullets.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>

              {/* Lokasi Penempatan */}
              <div className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">{language === 'id' ? 'Lokasi Penempatan' : 'Placement Location'}</h4>
                <p className="font-medium text-slate-600 dark:text-slate-400">{activeJobModal.placementInfo}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="shrink-0 px-4 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => { handleRemoveSaved(activeJobModal.id); setActiveJobModal(null); }}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
              >
                {t.pelamar.tersimpan.remove}
              </button>
              <button
                onClick={() => { handleApplyWithCv(activeJobModal.id, activeJobModal.company, activeJobModal.title); setActiveJobModal(null); }}
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-2"
              >
                <Send size={15} />
                <span>{t.pelamar.tersimpan.applyNow}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SavedJobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A4B9F]"></div></div>}>
      <SavedJobsContent />
    </Suspense>
  );
}
