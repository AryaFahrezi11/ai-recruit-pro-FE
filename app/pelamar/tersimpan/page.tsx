'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Bookmark,
  BookmarkCheck,
  Search,
  MapPin,
  GraduationCap,
  Briefcase,
  DollarSign,
  Trash2,
  Send,
  CheckCircle2,
  Sparkles,
  Info,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
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
  workPolicy: string;
  salary: string;
  postedAgo: string;
  matchScore: number;
  reason: string;
  descriptionBullets: string[];
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

  // Default dataset of all available candidate jobs
  const initialMasterJobs: SavedJob[] = [
    {
      id: 101,
      title: 'Admin Stocking (Mangga Besar)',
      company: 'Mint Patisserie',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=80',
      location: 'Jakarta Barat, DKI Jakarta',
      education: 'Minimal SMA/SMK/Sederajat',
      workPolicy: 'Kontrak • Kerja dari kantor (WFO)',
      salary: 'Rp 2.000.000 - Rp 2.500.000',
      postedAgo: 'Terakhir diperbarui 2 hari yang lalu',
      matchScore: 95,
      reason: 'Keteletihan data stok & kemampuan komputasi dasar di CV Anda sangat relevan.',
      descriptionBullets: [
        'Menyusun laporan stok dan status inventaris secara berkala.',
        'Memberi label, menyimpan, dan menata barang di lokasi penyimpanan yang sesuai.',
        'Memantau ketersediaan barang dan melaporkan jika ada kekurangan atau ketidaksesuaian.'
      ],
      placementInfo: 'Untuk lokasi di Mangga Besar, Jakarta Barat',
      criteriaBullets: [
        'Pria/Wanita 18 - 25 Tahun, Rapi & Teliti.',
        'WAJIB BISA MENGGUNAKAN KOMPUTER Rajin.'
      ],
      savedAt: '28 Juli 2026'
    },
    {
      id: 102,
      title: 'Staff Admin Klinik',
      company: 'Medika Utama Clinic',
      logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=120&auto=format&fit=crop&q=80',
      location: 'Kota Depok, Jawa Barat',
      education: 'Minimal SMA/SMK/Sederajat',
      workPolicy: 'Kontrak • Kerja dari kantor (WFO)',
      salary: 'Rp 2.400.000 - Rp 2.700.000',
      postedAgo: 'Terakhir diperbarui 3 hari yang lalu',
      matchScore: 92,
      reason: 'Kemampuan komunikasi ramah & administrasi dokumen sesuai standar klinik.',
      descriptionBullets: [
        'Mengelola pendaftaran pasien dan jadwal konsultasi dokter.',
        'Melakukan pencatatan administrasi rekam medis dan klaim asuransi kesehatan.'
      ],
      placementInfo: 'Margonda, Depok',
      criteriaBullets: [
        'Pendidikan minimal SMA/SMK Sederajat.',
        'Komunikatif, ramah, dan berpenampilan rapi.'
      ],
      savedAt: '28 Juli 2026'
    },
    {
      id: 103,
      title: 'Call Center',
      company: 'PT Citra Indojaya Perkasa',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
      location: 'Jakarta Utara, DKI Jakarta',
      education: 'Minimal D3/D4',
      workPolicy: 'Full time • Hybrid',
      salary: 'Rp 5.729.876 - Rp 7.000.000',
      postedAgo: 'Terakhir diperbarui 1 hari yang lalu',
      matchScore: 94,
      reason: 'Skor komunikasi lisan & pemecahan masalah Anda sangat baik.',
      descriptionBullets: [
        'Menerima panggilan masuk (inbound call) dan menangani keluhan pelanggan.',
        'Eskalasi masalah teknis ke tim terkait.'
      ],
      placementInfo: 'Sunter, Jakarta Utara',
      criteriaBullets: [
        'Pendidikan D3 / S1 Semua Jurusan.',
        'Pengalaman customer service 1 tahun.'
      ],
      savedAt: '28 Juli 2026'
    },
    {
      id: 104,
      title: 'IT Application Developer',
      company: 'PT Supra Boga Lestari Tbk',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      location: 'Jakarta Barat, DKI Jakarta',
      education: 'Minimal D3/S1 Informatika',
      workPolicy: 'Full time • Hybrid',
      salary: 'Rp 8.000.000 - Rp 12.000.000',
      postedAgo: 'Terakhir diperbarui 17 jam yang lalu',
      matchScore: 96,
      reason: 'Pengalaman Next.js & React pada CV ATS Anda mempunyai keselarasan 96%.',
      descriptionBullets: [
        'Mengembangkan platform e-commerce & aplikasi manajemen stok ritel.',
        'Integrasi RESTful API & arsitektur Frontend modern berbasis React/Next.js.'
      ],
      placementInfo: 'Kedoya, Jakarta Barat',
      criteriaBullets: [
        'Pengalaman minimal 2 tahun sebagai Frontend / Fullstack Developer.',
        'Menguasai TypeScript, React, Next.js, dan REST API.'
      ],
      savedAt: '29 Juli 2026'
    },
    {
      id: 105,
      title: 'Front-End Web Designer (Remote – Indonesia)',
      company: 'Wanderus Technologies',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
      location: 'Bali (Jarak jauh)',
      education: 'Minimal D3/S1',
      workPolicy: 'Full time • Remote (WFH)',
      salary: 'Rp 7.000.000 - Rp 10.000.000',
      postedAgo: 'Terakhir diperbarui 5 hari yang lalu',
      matchScore: 91,
      reason: 'Portofolio UI/UX Design & komponen React pas dengan kebutuhan tim global.',
      descriptionBullets: [
        'Merancang antarmuka pengguna Web SaaS yang intuitif dan responsif.',
        'Menerjemahkan desain Figma ke dalam komponen React / Tailwind CSS.'
      ],
      placementInfo: 'Remote (Kerja Dari Mana Saja)',
      criteriaBullets: [
        'Minimal 2 tahun pengalaman UI/UX & Frontend Design.',
        'Portofolio web desain aktif dapat ditunjukkan.'
      ],
      savedAt: '30 Juli 2026'
    },
    {
      id: 106,
      title: 'Staff Accounting',
      company: 'PT Maju Sejahtera Abadi',
      logo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=120&auto=format&fit=crop&q=80',
      location: 'Jakarta Selatan, DKI Jakarta',
      education: 'Minimal D3/S1 Akuntansi',
      workPolicy: 'Full time • Kerja dari kantor (WFO)',
      salary: 'Rp 5.000.000 - Rp 7.000.000',
      postedAgo: 'Terakhir diperbarui 1 hari yang lalu',
      matchScore: 88,
      reason: 'Pemahaman laporan keuangan & pencatatan transaksi sangat sesuai.',
      descriptionBullets: ['Membuat laporan keuangan bulanan dan jurnal umum.'],
      placementInfo: 'Jakarta Selatan',
      criteriaBullets: ['Minimal D3/S1 Akuntansi.'],
      savedAt: '30 Juli 2026'
    },
    {
      id: 107,
      title: 'Digital Marketing Specialist',
      company: 'PT Kreasi Digital Nusantara',
      logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=120&auto=format&fit=crop&q=80',
      location: 'Bandung, Jawa Barat',
      education: 'Minimal S1 Marketing/Komunikasi',
      workPolicy: 'Full time • Hybrid',
      salary: 'Rp 6.000.000 - Rp 9.000.000',
      postedAgo: 'Terakhir diperbarui 4 jam yang lalu',
      matchScore: 89,
      reason: 'Pengalaman campaign digital & analitik media sosial Anda sangat relevan.',
      descriptionBullets: ['Mengelola campaign Google Ads, Meta Ads, dan TikTok Ads.'],
      placementInfo: 'Dago, Bandung',
      criteriaBullets: ['Pengalaman minimal 1 tahun di bidang Digital Marketing.'],
      savedAt: '31 Juli 2026'
    },
    {
      id: 108,
      title: 'Customer Service Representative',
      company: 'PT Tokopedia Care',
      logo: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=120&auto=format&fit=crop&q=80',
      location: 'Jakarta Pusat, DKI Jakarta',
      education: 'Minimal SMA/SMK/Sederajat',
      workPolicy: 'Kontrak • Kerja dari kantor (WFO)',
      salary: 'Rp 4.500.000 - Rp 5.500.000',
      postedAgo: 'Terakhir diperbarui 6 jam yang lalu',
      matchScore: 90,
      reason: 'Layanan pelanggan & empati komunikasi sesuai profil.',
      descriptionBullets: ['Melayani pertanyaan dan kendala pengguna Tokopedia.'],
      placementInfo: 'Menteng, Jakarta Pusat',
      criteriaBullets: ['Pendidikan minimal SMA/SMK Sederajat.'],
      savedAt: '01 Agustus 2026'
    },
    {
      id: 109,
      title: 'Backend Engineer (Node.js)',
      company: 'PT Solusi Teknologi Indonesia',
      logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=120&auto=format&fit=crop&q=80',
      location: 'Surabaya, Jawa Timur',
      education: 'Minimal S1 Teknik Informatika',
      workPolicy: 'Full time • Remote (WFH)',
      salary: 'Rp 10.000.000 - Rp 15.000.000',
      postedAgo: 'Terakhir diperbarui 12 jam yang lalu',
      matchScore: 93,
      reason: 'Skill Node.js & pengalaman arsitektur microservices Anda sangat sesuai.',
      descriptionBullets: ['Mengembangkan dan maintain RESTful API & GraphQL services.'],
      placementInfo: 'Remote (Seluruh Indonesia)',
      criteriaBullets: ['Pengalaman minimal 3 tahun sebagai Backend Developer.'],
      savedAt: '02 Agustus 2026'
    },
    {
      id: 110,
      title: 'HRD & Recruitment Staff',
      company: 'PT Global Talent Solutions',
      logo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&auto=format&fit=crop&q=80',
      location: 'Tangerang, Banten',
      education: 'Minimal S1 Psikologi/Manajemen',
      workPolicy: 'Full time • Kerja dari kantor (WFO)',
      salary: 'Rp 5.500.000 - Rp 8.000.000',
      postedAgo: 'Terakhir diperbarui 2 hari yang lalu',
      matchScore: 86,
      reason: 'Latar belakang manajemen SDM & keterampilan komunikasi Anda relevan.',
      descriptionBullets: ['Mengelola proses rekrutmen end-to-end dari sourcing hingga onboarding.'],
      placementInfo: 'BSD City, Tangerang Selatan',
      criteriaBullets: ['Pendidikan S1 Psikologi atau Manajemen SDM.'],
      savedAt: '03 Agustus 2026'
    }
  ];

  // Saved Jobs ID list state
  const [savedJobIds, setSavedJobIds] = useState<any[]>([101, 104, 105]);
  const [apiSavedJobs, setApiSavedJobs] = useState<any[]>([]);

  useEffect(() => {
    // Load candidate CV data
    const savedCv = localStorage.getItem('candidateCvData');
    if (savedCv) {
      setCvDetails(JSON.parse(savedCv));
    }

    // Load applied jobs
    const savedApplied = localStorage.getItem('appliedJobsList');
    if (savedApplied) {
      setAppliedJobs(JSON.parse(savedApplied));
    }

    // Load saved job IDs from localStorage
    const storedSavedIds = localStorage.getItem('candidateSavedJobsList');
    if (storedSavedIds) {
      try {
        setSavedJobIds(JSON.parse(storedSavedIds));
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('candidateSavedJobsList', JSON.stringify([101, 104, 105]));
    }

    // Fetch from Backend API
    const fetchBackendSavedJobs = async () => {
      try {
        const res = await api.get('/saved-jobs/');
        if (Array.isArray(res) && res.length > 0) {
          setApiSavedJobs(res);
          const backendIds = res.map((item: any) => item.id);
          setSavedJobIds((prev) => Array.from(new Set([...prev, ...backendIds])));
        }
      } catch (err) {
        console.error('Failed to fetch backend saved jobs:', err);
      }
    };
    fetchBackendSavedJobs();
  }, []);

  // Remove saved job
  const handleRemoveSaved = async (jobId: any) => {
    const newSaved = savedJobIds.filter((id) => String(id) !== String(jobId));
    setSavedJobIds(newSaved);
    setApiSavedJobs((prev) => prev.filter((item) => String(item.id) !== String(jobId)));
    localStorage.setItem('candidateSavedJobsList', JSON.stringify(newSaved));

    try {
      await api.delete(`/saved-jobs/${jobId}`);
    } catch (err) {
      console.error('Failed to remove saved job from backend:', err);
    }
  };

  // Clear all saved jobs
  const handleClearAllSaved = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua lowongan tersimpan?')) {
      savedJobIds.forEach(async (id) => {
        try {
          await api.delete(`/saved-jobs/${id}`);
        } catch (_) {}
      });
      setSavedJobIds([]);
      setApiSavedJobs([]);
      localStorage.setItem('candidateSavedJobsList', JSON.stringify([]));
    }
  };

  // Direct Apply Handler
  const handleApplyWithCv = (jobId: any, companyName: string, title: string) => {
    const newApplied = [...appliedJobs, jobId];
    setAppliedJobs(newApplied);
    localStorage.setItem('appliedJobsList', JSON.stringify(newApplied));

    alert(`🎉 Sukses! CV ATS-Friendly Anda ("${cvDetails?.fullName || 'Pelamar'}") telah terkirim ke HR ${companyName} untuk posisi "${title}".`);
    router.push('/pelamar/status');
  };

  // Filter saved jobs list
  const visibleSavedJobs = useMemo(() => {
    const savedIdsSet = new Set(savedJobIds.map((id) => String(id)));

    apiSavedJobs.forEach((item) => {
      if (item.id) savedIdsSet.add(String(item.id));
      if (item.job_id) savedIdsSet.add(String(item.job_id));
      if (item.saved_id) savedIdsSet.add(String(item.saved_id));
    });

    const resultList: SavedJob[] = [];

    savedIdsSet.forEach((idStr) => {
      const master = initialMasterJobs.find((m) => String(m.id) === idStr);
      const apiItem = apiSavedJobs.find((a) => String(a.id) === idStr || String(a.job_id) === idStr);

      if (master) {
        resultList.push({
          ...master,
          savedAt: apiItem?.savedAt || master.savedAt || 'Terbaru'
        });
      } else if (apiItem && apiItem.title && apiItem.company) {
        resultList.push(apiItem);
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
  }, [initialMasterJobs, apiSavedJobs, savedJobIds, searchQuery, policyFilter]);

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
          <span className="text-3xl font-black text-white">{savedJobIds.length}</span>
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

            {savedJobIds.length > 0 && (
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
            href="/pelamar/dashboard"
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

                  {/* PO-FIT AI Match Banner */}
                  <div className="p-3 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800/80 border border-[#C2E5EF] dark:border-slate-700 text-xs text-[#2596be] dark:text-cyan-300 space-y-1">
                    <div className="flex items-center justify-between font-extrabold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={14} /> Kecocokan PO-FIT AI
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-[#B8E1ED] text-[11px]">
                        {job.matchScore}% Kecocokan
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-normal line-clamp-2">
                      {job.reason}
                    </p>
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

      {/* JOB DETAIL MODAL */}
      {activeJobModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">

            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-start gap-4">
                <img
                  src={activeJobModal.logo}
                  alt={activeJobModal.company}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                    {activeJobModal.title}
                  </h3>
                  <p className="text-xs font-bold text-[#2596be] dark:text-cyan-400">
                    {activeJobModal.company}
                  </p>
                  <p className="text-xs text-slate-400">{activeJobModal.location}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveJobModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Deskripsi Pekerjaan
              </h4>
              <ul className="space-y-1.5 list-disc pl-5">
                {activeJobModal.descriptionBullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            {/* Qualifications */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Kualifikasi &amp; Persyaratan
              </h4>
              <ul className="space-y-1.5 list-disc pl-5">
                {activeJobModal.criteriaBullets.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  handleRemoveSaved(activeJobModal.id);
                  setActiveJobModal(null);
                }}
                className="px-4 py-2.5 rounded-full border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 cursor-pointer"
              >
                {t.pelamar.tersimpan.remove}
              </button>

              <button
                onClick={() => {
                  handleApplyWithCv(activeJobModal.id, activeJobModal.company, activeJobModal.title);
                  setActiveJobModal(null);
                }}
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
