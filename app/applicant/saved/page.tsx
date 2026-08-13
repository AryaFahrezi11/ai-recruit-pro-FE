'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Sparkles,
  ArrowRight,
  ChevronRight,
  X,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';

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

export default function SavedJobsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [policyFilter, setPolicyFilter] = useState('Semua');

  const [cvDetails, setCvDetails] = useState<any>(null);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [activeJobModal, setActiveJobModal] = useState<SavedJob | null>(null);
  const [masterJobs, setMasterJobs] = useState<SavedJob[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<any[]>([]);

  useEffect(() => {
    // Load candidate CV data
    const savedCv = localStorage.getItem('candidateCvData');
    if (savedCv) {
      try { setCvDetails(JSON.parse(savedCv)); } catch(e){}
    }

    // Load applied jobs
    const savedApplied = localStorage.getItem('appliedJobsList');
    if (savedApplied) {
      try { setAppliedJobs(JSON.parse(savedApplied)); } catch(e){}
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
        } catch (e) {}

        // 2. Fetch all jobs from backend API
        const resJobs = await api.get('/jobs/');
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
                if (expVal <= 1) return '< 1 Tahun';
                if (expVal <= 3) return `${expVal} Tahun`;
                return `> ${expVal} Tahun`;
              }
              return expVal || 'Semua Pengalaman';
            })();

            const createdDate = j.tanggal_buka ? new Date(j.tanggal_buka) : (j.created_at ? new Date(j.created_at) : new Date());
            const now = new Date();
            const createdStartOfDay = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
            const nowStartOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const diffDays = Math.floor((nowStartOfDay.getTime() - createdStartOfDay.getTime()) / (1000 * 60 * 60 * 24));

            const postedAgoText = (() => {
              if (diffDays <= 0) return 'Hari ini';
              if (diffDays === 1) return '1 hari yang lalu';
              return `${diffDays} hari yang lalu`;
            })();
            const isNewJob = diffDays >= 0 && diffDays <= 7;

            return {
              id: j.id,
              title: j.judul_posisi,
              company: j.perusahaan?.nama_perusahaan || 'Perusahaan',
              logo: (j.perusahaan?.logo_url && j.perusahaan.logo_url !== '') 
                    ? (j.perusahaan.logo_url.startsWith('http') ? j.perusahaan.logo_url : `http://${typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'}:8000${j.perusahaan.logo_url}`)
                    : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
              location: j.kota || (j.perusahaan?.kota ? j.perusahaan.kota : 'Remote'),
              education: j.pendidikan_min || safeParseArray(j.kualifikasi)[0] || 'Terbuka untuk umum',
              educationLevel: j.pendidikan_min || 'SMA/SMK/D3/S1',
              experienceLevel: expLevel,
              openingsCount: j.openings_count || 1,
              benefits: benefitsArray,
              workPolicy: (() => {
                const type = j.tipe_pekerjaan ? j.tipe_pekerjaan.split('_').map((w: any) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Full Time';
                const loc = j.lokasi_kerja === 'remote' ? 'Remote (WFH)' : j.lokasi_kerja === 'hybrid' ? 'Hybrid' : 'On-site';
                return `${type} (${loc})`;
              })(),
              salary: (j.tampilkan_gaji && j.gaji_min && j.gaji_max) ? `Rp ${(j.gaji_min/1000000).toFixed(0)} Jt - Rp ${(j.gaji_max/1000000).toFixed(0)} Jt` : 'Gaji Dirahasiakan',
              postedAgo: postedAgoText,
              publishDate: createdDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
              applicationDeadline: j.tanggal_tutup ? new Date(j.tanggal_tutup).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null,
              isPromoted: j.is_promoted || false,
              isNew: isNewJob,
              matchScore: j.match_score || 92,
              reason: j.reason || 'Keahlian & kualifikasi Anda sesuai dengan posisi ini.',
              descriptionBullets: safeParseArray(j.deskripsi_pekerjaan),
              responsibilitiesBullets: safeParseArray(j.tanggung_jawab),
              placementInfo: j.kota ? `Untuk lokasi di ${j.kota}` : (j.lokasi_kerja === 'remote' ? 'Remote (Kerja Dari Mana Saja)' : 'Lokasi Perusahaan'),
              criteriaBullets: safeParseArray(j.kualifikasi),
              savedAt: j.tanggal_buka ? new Date(j.tanggal_buka).toLocaleDateString('id-ID') : 'Terbaru'
            };
          });
          setMasterJobs(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch master jobs:', err);
      }
    };
    fetchRealData();
  }, []);

  // Remove saved job
  const handleRemoveSaved = async (jobId: any) => {
    const newSaved = savedJobIds.filter((id) => String(id) !== String(jobId));
    setSavedJobIds(newSaved);
    localStorage.setItem('candidateSavedJobsList', JSON.stringify(newSaved));
    try {
      await api.delete(`/saved-jobs/${jobId}`);
    } catch (err) {}
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

    alert(`🎉 Sukses! CV ATS-Friendly Anda ("${cvDetails?.fullName || 'Pelamar'}") telah terkirim ke HR ${companyName} untuk posisi "${title}".`);
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
      const matchesQuery =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());

      const policyLower = job.workPolicy ? job.workPolicy.toLowerCase() : '';
      const filterLower = policyFilter.toLowerCase();
      const matchesPolicy =
        policyFilter === 'Semua' ||
        policyLower.includes(filterLower) ||
        (policyFilter === 'Remote' && (policyLower.includes('wfh') || policyLower.includes('remote')));

      return matchesQuery && matchesPolicy;
    });
  }, [masterJobs, savedJobIds, searchQuery, policyFilter]);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#2596be] via-[#1b7b9e] to-[#0c2b3d] rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold backdrop-blur-md border border-white/20">
            <Bookmark className="w-3.5 h-3.5 fill-current text-cyan-300" />
            <span>Lowongan Impian Anda</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {t.pelamar.tersimpan.title}
          </h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {t.pelamar.tersimpan.subtitle}
          </p>
        </div>

        {/* Counter Badge */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl shrink-0 text-center space-y-1 self-start md:self-center">
          <span className="text-3xl font-black text-white">{visibleSavedJobs.length}</span>
          <span className="block text-xs font-bold text-cyan-200">Total Lowongan Tersimpan</span>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Search Box */}
          <div className="relative w-full sm:w-96 flex items-center">
            <Search className="absolute left-4 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dalam lowongan tersimpan..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#2596be]"
            />
          </div>

          {/* Filter Dropdown & Clear All */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={policyFilter}
              onChange={(e) => setPolicyFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold outline-none cursor-pointer"
            >
              <option value="Semua">Semua Kebijakan Kerja</option>
              <option value="WFO">Kerja dari Kantor (WFO)</option>
              <option value="Remote">Remote / WFH</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            {visibleSavedJobs.length > 0 && (
              <button
                onClick={handleClearAllSaved}
                className="px-4 py-2.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Hapus Semua</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* SAVED JOBS LIST GRID */}
      {visibleSavedJobs.length === 0 ? (
        /* EMPTY STATE CARD */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 max-w-2xl mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-[#F0F8FB] dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-800 dark:text-white">
              {t.pelamar.tersimpan.noSavedJobs}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Jelajahi berbagai posisi lowongan kerja terbaik di halaman Cari Lowongan dan simpan lowongan favorit Anda.
            </p>
          </div>
          <Link
            href="/applicant/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            <span>{t.pelamar.tersimpan.startSearching}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleSavedJobs.map((job) => {
            const isApplied = appliedJobs.includes(job.id);

            return (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative group"
              >
                {/* Top Company & Title */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <img
                      src={job.logo}
                      alt={job.company}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />

                    {/* Unsave Button */}
                    <button
                      onClick={() => handleRemoveSaved(job.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Hapus dari simpanan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3
                      onClick={() => setActiveJobModal(job)}
                      className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-[#2596be] transition-colors cursor-pointer line-clamp-1"
                    >
                      {job.title}
                    </h3>
                    <p className="text-xs font-bold text-[#2596be] dark:text-cyan-400">
                      {job.company}
                    </p>
                  </div>

                  {/* Bullet Infos */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#2596be] shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap size={14} className="text-[#2596be] shrink-0" />
                      <span>{job.education}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-[#2596be] shrink-0" />
                      <span>{job.workPolicy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-[#2596be] shrink-0" />
                      <span className="font-extrabold text-slate-800 dark:text-white">{job.salary}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Disimpan pada: {job.savedAt}</span>
                    <button
                      onClick={() => setActiveJobModal(job)}
                      className="font-bold text-[#2596be] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Detail</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {isApplied ? (
                    <div className="w-full py-3 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-300">
                      <CheckCircle2 size={16} /> Lamaran &amp; CV Terkirim
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApplyWithCv(job.id, job.company, job.title)}
                      className="w-full py-3 rounded-2xl bg-[#2596be] hover:bg-[#1D7FA1] text-white font-extrabold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] flex flex-col overflow-hidden">

            {/* Detail Header */}
            <div className="shrink-0 p-6 sm:p-8 pb-4 space-y-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <img
                    src={activeJobModal.logo}
                    alt={activeJobModal.company}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-[#2596be] dark:text-cyan-400">{activeJobModal.company}</span>
                      {activeJobModal.isNew && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] border border-amber-200">Loker Terbaru</span>
                      )}
                      {activeJobModal.isPromoted && (
                        <span className="px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-extrabold text-[10px]">Dipromosikan</span>
                      )}
                    </div>
                    <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight">{activeJobModal.title}</h3>
                    {activeJobModal.openingsCount > 0 && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F1F7] dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 text-xs font-extrabold border border-[#B8E1ED]">
                        Kuota Terbuka: {activeJobModal.openingsCount} Posisi
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setActiveJobModal(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <MapPin size={14} className="text-[#2596be] shrink-0" />
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold">Lokasi</p><p className="font-extrabold">{activeJobModal.location}</p></div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <GraduationCap size={14} className="text-[#2596be] shrink-0" />
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold">Min. Pendidikan</p><p className="font-extrabold">{activeJobModal.educationLevel}</p></div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <Briefcase size={14} className="text-[#2596be] shrink-0" />
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold">Tipe Kerja</p><p className="font-extrabold">{activeJobModal.workPolicy}</p></div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <DollarSign size={14} className="text-[#2596be] shrink-0" />
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold">Gaji</p><p className="font-black text-[#2596be] dark:text-cyan-400">{activeJobModal.salary}</p></div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <Clock size={14} className="text-[#2596be] shrink-0" />
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold">Batas Lamaran</p><p className="font-extrabold">{activeJobModal.applicationDeadline || 'Tidak ditentukan'}</p></div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <CheckCircle2 size={14} className="text-[#2596be] shrink-0" />
                  <div><p className="text-[10px] text-slate-400 uppercase font-bold">Pengalaman</p><p className="font-extrabold">{activeJobModal.experienceLevel}</p></div>
                </div>
              </div>

              {/* Benefits */}
              {activeJobModal.benefits && activeJobModal.benefits.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Fasilitas &amp; Benefit:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeJobModal.benefits.map((b, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full bg-[#F0F8FB] dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 text-[11px] font-bold border border-[#C2E5EF]">✓ {b}</span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 font-bold italic">
                Diterbitkan: {activeJobModal.publishDate} • {activeJobModal.postedAgo}
              </p>
            </div>

            {/* Scrollable Description Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5">
              {/* Deskripsi */}
              <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Gambaran Umum &amp; Deskripsi Pekerjaan</h4>
                <ul className="space-y-1.5 list-disc pl-5">
                  {activeJobModal.descriptionBullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>

              {/* Tanggung Jawab */}
              {activeJobModal.responsibilitiesBullets && activeJobModal.responsibilitiesBullets.length > 0 && (
                <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Tanggung Jawab Utama</h4>
                  <ul className="space-y-1.5 list-disc pl-5 font-semibold">
                    {activeJobModal.responsibilitiesBullets.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}

              {/* Kualifikasi */}
              <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Kualifikasi &amp; Persyaratan</h4>
                <ul className="space-y-1.5 list-disc pl-5 font-semibold">
                  {activeJobModal.criteriaBullets.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>

              {/* Lokasi Penempatan */}
              <div className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Lokasi Penempatan</h4>
                <p className="font-medium text-slate-600 dark:text-slate-400">{activeJobModal.placementInfo}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => { handleRemoveSaved(activeJobModal.id); setActiveJobModal(null); }}
                className="px-4 py-2.5 rounded-full border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 cursor-pointer"
              >
                {t.pelamar.tersimpan.remove}
              </button>
              <button
                onClick={() => { handleApplyWithCv(activeJobModal.id, activeJobModal.company, activeJobModal.title); setActiveJobModal(null); }}
                className="px-6 py-2.5 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-2"
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
