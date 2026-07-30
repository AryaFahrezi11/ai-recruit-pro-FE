'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  X,
  Building2,
  SlidersHorizontal,
  Sparkles,
  DollarSign,
  CheckCircle2,
  Clock,
  Send,
  Info,
  ChevronRight,
  ChevronDown,
  Share2,
  ExternalLink,
  GraduationCap,
  FileText,
  Building,
  Check,
  Award,
  Zap,
  HelpCircle
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  location: string;
  education: string;
  workPolicy: string;
  salary: string;
  postedAgo: string;
  isPromoted?: boolean;
  matchScore: number;
  reason: string;
  descriptionBullets: string[];
  placementInfo: string;
  criteriaBullets: string[];
}

interface Company {
  id: number;
  name: string;
  logo: string;
  industry: string;
  location: string;
  openJobsCount: number;
  description: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') || 'recommended';

  const [activeTab, setActiveTab] = useState<'recommended' | 'companies' | 'saved'>(
    initialView === 'companies' ? 'companies' : initialView === 'saved' ? 'saved' : 'recommended'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [educationFilter, setEducationFilter] = useState('Semua');
  const [workPolicyFilter, setWorkPolicyFilter] = useState('Semua');

  // Currently selected job ID for the right side detail pane
  const [selectedJobId, setSelectedJobId] = useState<number>(101);

  const [cvDetails, setCvDetails] = useState<any>(null);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<number[]>([101]);

  useEffect(() => {
    const savedCv = localStorage.getItem('candidateCvData');
    if (savedCv) {
      setCvDetails(JSON.parse(savedCv));
    } else {
      setCvDetails({
        fullName: 'Budi Pratama',
        jobTitle: 'Senior Frontend Engineer',
        skills: 'React, Next.js, TypeScript, Tailwind CSS',
        updatedAt: 'Hari ini'
      });
    }

    const savedApplied = localStorage.getItem('appliedJobsList');
    if (savedApplied) {
      setAppliedJobs(JSON.parse(savedApplied));
    }
  }, []);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'companies') setActiveTab('companies');
    else if (view === 'saved') setActiveTab('saved');
  }, [searchParams]);

  // Companies List
  const companiesList: Company[] = [
    {
      id: 1,
      name: 'Mint Patisserie',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=80',
      industry: 'Kuliner & F&B Modern',
      location: 'Jakarta Barat, DKI Jakarta',
      openJobsCount: 4,
      description: 'Produsen pastry & toko roti premium terkemuka dengan beberapa cabang di Jakarta.'
    },
    {
      id: 2,
      name: 'PT Tiga Putri Bijaksana',
      logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=120&auto=format&fit=crop&q=80',
      industry: 'Layanan Kesehatan & Klinik',
      location: 'Kota Depok, Jawa Barat',
      openJobsCount: 6,
      description: 'Jaringan klinik medis & penyedia administrasi kesehatan tepercaya.'
    },
    {
      id: 3,
      name: 'PT Citra Indojaya Perkasa',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
      industry: 'Telekomunikasi & Call Center',
      location: 'Jakarta Utara, DKI Jakarta',
      openJobsCount: 10,
      description: 'Penyedia layanan alih daya customer care & telemarketing nasional.'
    },
    {
      id: 4,
      name: 'PT Supra Boga Lestari Tbk',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      industry: 'Ritel & Supermarket Tech',
      location: 'Jakarta Barat, DKI Jakarta',
      openJobsCount: 12,
      description: 'Pengelola jaringan supermarket Ranch Market & Farmers Market di Indonesia.'
    },
    {
      id: 5,
      name: 'Wanderus Technologies',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
      industry: 'Software & Cloud Solutions',
      location: 'Bali (Jarak Jauh)',
      openJobsCount: 8,
      description: 'Global tech studio mengembangkan platform SaaS berbasis kecerdasan buatan.'
    }
  ];

  // Jobs Dataset matching KitaLulus Layout Screenshot
  const jobsList: Job[] = [
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
      isPromoted: true,
      matchScore: 95,
      reason: 'Keteletihan data stok & kemampuan komputasi dasar di CV Anda sangat relevan.',
      descriptionBullets: [
        'Menyusun laporan stok dan status inventaris secara berkala.',
        'Memberi label, menyimpan, dan menata barang di lokasi penyimpanan yang sesuai.',
        'Memantau ketersediaan barang dan melaporkan jika ada kekurangan atau ketidaksesuaian.',
        'Membantu dalam proses stock opname dan audit inventaris rutin.'
      ],
      placementInfo: 'Untuk lokasi di Mangga Besar, Jakarta Barat',
      criteriaBullets: [
        'BERSEDIA DATANG UNTUK TEST LANGSUNG di Mangga Besar, Jakarta Barat.',
        'Pria/Wanita 18 - 25 Tahun, Rapi & Teliti.',
        'WAJIB BISA MENGGUNAKAN KOMPUTER Rajin (tidak malas), inisiatif tinggi, jujur.',
        'Bisa bekerja full time - 6 hari dalam 1 minggu jam 08.30 s/d 18.00.',
        'Tanggal merah tetap masuk (Shift / Kontrak 1 Tahun).'
      ]
    },
    {
      id: 102,
      title: 'admin Klinik',
      company: 'PT tiga putri bijaksana',
      logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=120&auto=format&fit=crop&q=80',
      location: 'Kota Depok, Jawa Barat',
      education: 'Minimal SMA/SMK/Sederajat',
      workPolicy: 'Kontrak • Kerja dari kantor (WFO)',
      salary: 'Rp 2.400.000 - Rp 2.700.000',
      postedAgo: 'Terakhir diperbarui 3 hari yang lalu',
      isPromoted: true,
      matchScore: 92,
      reason: 'Kemampuan komunikasi ramah & administrasi dokumen sesuai standar klinik.',
      descriptionBullets: [
        'Mengelola pendaftaran pasien dan jadwal konsultasi dokter.',
        'Melakukan pencatatan administrasi rekam medis dan klaim asuransi kesehatan.',
        'Menyusun rekapitulasi harian transaksi klinik.'
      ],
      placementInfo: 'Untuk lokasi di Margonda, Kota Depok',
      criteriaBullets: [
        'Pendidikan minimal SMA/SMK Sederajat.',
        'Komunikatif, ramah, dan berpenampilan rapi.',
        'Menguasai Microsoft Word & Excel dasar.'
      ]
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
      isPromoted: true,
      matchScore: 94,
      reason: 'Skor komunikasi lisan lisan & pemecahan masalah Anda sangat baik.',
      descriptionBullets: [
        'Menerima panggilan masuk (inbound call) dan menangani keluhan pelanggan.',
        'Eskalasi masalah teknis ke tim terkait dan mencatat ticketing sistem.'
      ],
      placementInfo: 'Sunter, Jakarta Utara',
      criteriaBullets: [
        'Pendidikan D3 / S1 Semua Jurusan.',
        'Artikulasi suara jelas dan tidak dialek kental.',
        'Bersedia bekerja sistem shift.'
      ]
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
      isPromoted: false,
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
      ]
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
      isPromoted: false,
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
      ]
    }
  ];

  // Save Job Toggle
  const toggleSaveJob = (jobId: number) => {
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter((id) => id !== jobId));
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
    }
  };

  // Direct Apply Handler
  const handleApplyWithCv = (jobId: number, companyName: string, title: string) => {
    const newApplied = [...appliedJobs, jobId];
    setAppliedJobs(newApplied);
    localStorage.setItem('appliedJobsList', JSON.stringify(newApplied));

    alert(`🎉 Sukses! CV ATS-Friendly Anda ("${cvDetails?.fullName || 'Budi Pratama'}") telah terkirim ke HR ${companyName} untuk posisi "${title}".`);
    router.push('/pelamar/status');
  };

  // Filter Jobs List
  const filteredJobs = useMemo(() => {
    return jobsList.filter((job) => {
      if (activeTab === 'saved') return savedJobIds.includes(job.id);

      const matchesSearch = !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation = !locationQuery || job.location.toLowerCase().includes(locationQuery.toLowerCase());

      const matchesEdu = educationFilter === 'Semua' || job.education.includes(educationFilter);
      const matchesWork = workPolicyFilter === 'Semua' || job.workPolicy.includes(workPolicyFilter);

      return matchesSearch && matchesLocation && matchesEdu && matchesWork;
    });
  }, [jobsList, savedJobIds, activeTab, searchQuery, locationQuery, educationFilter, workPolicyFilter]);

  // Selected Job Details Object for Right Pane
  const selectedJob = useMemo(() => {
    return jobsList.find((j) => j.id === selectedJobId) || filteredJobs[0] || jobsList[0];
  }, [jobsList, selectedJobId, filteredJobs]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">

      {/* VIBRANT TOP SEARCH BANNER (Primary Brand Color Header System) */}
      <div className="bg-gradient-to-r from-[#2596be] via-[#1b7b9e] to-[#0c2b3d] rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-5">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="grid grid-cols-1 md:grid-cols-12 gap-3"
        >
          {/* Left Input: Keyword */}
          <div className="md:col-span-5 relative flex items-center">
            <Search className="absolute left-4 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pekerjaan/perusahaan..."
              className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-800 rounded-2xl text-sm font-semibold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#2596be] shadow-inner"
            />
          </div>

          {/* Right Input: Location */}
          <div className="md:col-span-5 relative flex items-center">
            <MapPin className="absolute left-4 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Semua Lokasi (misal: Jakarta, Depok, Remote)"
              className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-800 rounded-2xl text-sm font-semibold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#2596be] shadow-inner"
            />
          </div>

          {/* Primary Color Search Action Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-[#2596be] hover:bg-[#1D7FA1] text-white rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/20"
            >
              <Search className="w-5 h-5" />
              <span>Cari</span>
            </button>
          </div>
        </form>

        {/* Filter Pill Dropdowns (Primary Theme Styling) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <button
            onClick={() => { setSearchQuery(''); setLocationQuery(''); setEducationFilter('Semua'); setWorkPolicyFilter('Semua'); }}
            className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Semua Filter</span>
            <span className="w-4 h-4 rounded-full bg-[#E0F1F7] text-[#2596be] flex items-center justify-center text-[10px] font-black">1</span>
          </button>

          {/* Edu filter */}
          <select
            value={educationFilter}
            onChange={(e) => setEducationFilter(e.target.value)}
            className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold border border-white/30 outline-none cursor-pointer text-xs"
          >
            <option className="text-slate-800" value="Semua">Minimum Pendidikan ∨</option>
            <option className="text-slate-800" value="SMA">SMA/SMK/Sederajat</option>
            <option className="text-slate-800" value="D3">D3/D4</option>
            <option className="text-slate-800" value="S1">S1 Informatika/Teknik</option>
          </select>

          {/* Policy filter */}
          <select
            value={workPolicyFilter}
            onChange={(e) => setWorkPolicyFilter(e.target.value)}
            className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold border border-white/30 outline-none cursor-pointer text-xs"
          >
            <option className="text-slate-800" value="Semua">Kebijakan Kerja ∨</option>
            <option className="text-slate-800" value="WFO">Kerja dari Kantor (WFO)</option>
            <option className="text-slate-800" value="Remote">Remote / Jarak Jauh</option>
            <option className="text-slate-800" value="Hybrid">Hybrid</option>
          </select>

          <button
            onClick={() => setActiveTab(activeTab === 'companies' ? 'recommended' : 'companies')}
            className={`px-4 py-2 rounded-full font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'companies'
                ? 'bg-[#E0F1F7] text-[#2596be] border-[#B8E1ED] font-extrabold'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/30'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Daftar Perusahaan ({companiesList.length})</span>
          </button>
        </div>
      </div>

      {/* DUAL-PANE SPLIT VIEW MAIN CONTAINER (Matching KitaLulus Screenshot) */}
      {activeTab === 'companies' ? (
        /* COMPANIES LIST VIEW */
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#F0F8FB] dark:bg-slate-900 border border-[#C2E5EF] dark:border-slate-800 space-y-1">
            <h3 className="font-extrabold text-[#2596be] text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#2596be]" />
              Fitur Perusahaan &amp; Informasi Loker Buka
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Lihat profil perusahaan terkemuka yang sedang aktif merekrut beserta jumlah lowongan kerja aktifnya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {companiesList.map((comp) => (
              <div
                key={comp.id}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <img
                      src={comp.logo}
                      alt={comp.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <span className="px-3 py-1 rounded-full bg-[#E0F1F7] dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 font-black text-xs border border-[#B8E1ED] dark:border-slate-700">
                      {comp.openJobsCount} Lowongan Buka
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-lg text-slate-800 dark:text-white">
                      {comp.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-bold">
                      {comp.industry} • {comp.location}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {comp.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSearchQuery(comp.name);
                    setActiveTab('recommended');
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#2596be] text-[#2596be] hover:bg-[#F0F8FB] dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Lihat {comp.openJobsCount} Lowongan Buka</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* DUAL-PANE KITALULUS SPLIT VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: SELECTABLE JOB CARDS LIST (~38% Width / 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Header info */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span>Info Loker Terbaru</span>
                  <Info className="w-4 h-4 text-slate-400" />
                </h2>
                <p className="text-xs text-slate-500 font-semibold">
                  Menampilkan {filteredJobs.length} Lowongan.
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                <span>Urut berdasarkan:</span>
                <span className="text-[#2596be] font-extrabold cursor-pointer">Rekomendasi PO-FIT ∨</span>
              </div>
            </div>

            {/* Job Cards List */}
            <div className="space-y-3.5 max-h-[85vh] overflow-y-auto pr-1">
              {filteredJobs.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                  <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Tidak ditemukan lowongan sesuai filter
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setLocationQuery(''); setEducationFilter('Semua'); setWorkPolicyFilter('Semua'); }}
                    className="px-4 py-2 rounded-full bg-[#2596be] text-white font-bold text-xs cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = selectedJob.id === job.id;
                  const isSaved = savedJobIds.includes(job.id);
                  const isApplied = appliedJobs.includes(job.id);

                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer relative space-y-3 ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 border-2 border-[#2596be] shadow-md ring-2 ring-[#2596be]/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                      }`}
                    >
                      {/* Top Header Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={job.logo}
                            alt={job.company}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white leading-snug hover:text-[#2596be]">
                              {job.title}
                            </h3>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                              {job.company}
                            </p>
                          </div>
                        </div>

                        {job.isPromoted && (
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">
                            Dipromosikan
                          </span>
                        )}
                      </div>

                      {/* Detail Bullet Badges */}
                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <GraduationCap size={13} className="text-slate-400 shrink-0" />
                          <span>{job.education}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={13} className="text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-700 dark:text-slate-200">{job.salary}</span>
                        </div>
                      </div>

                      {/* Card Bottom Time & Share/Bookmark */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <span className="text-slate-400 font-medium">
                          {job.postedAgo}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveJob(job.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#2596be] transition-colors"
                            title={isSaved ? 'Hapus Simpan' : 'Simpan Lowongan'}
                          >
                            {isSaved ? (
                              <BookmarkCheck size={16} className="text-[#2596be] fill-current" />
                            ) : (
                              <Bookmark size={16} />
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Link lowongan "${job.title}" telah disalin!`);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Bagikan"
                          >
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DYNAMIC JOB DETAIL PANE (~62% Width / 7 Cols) */}
          <div className="lg:col-span-7 sticky top-24">
            {selectedJob && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
                
                {/* Detail Header */}
                <div className="space-y-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedJob.logo}
                      alt={selectedJob.company}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="space-y-1">
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {selectedJob.title}
                      </h1>
                      <p className="text-sm font-extrabold text-[#2596be] dark:text-cyan-400">
                        {selectedJob.company}
                      </p>
                    </div>
                  </div>

                  {/* Bullet Info Badges List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold pt-1">
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-[#2596be] shrink-0" />
                      <span>{selectedJob.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap size={15} className="text-[#2596be] shrink-0" />
                      <span>{selectedJob.education}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={15} className="text-[#2596be] shrink-0" />
                      <span>{selectedJob.workPolicy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={15} className="text-[#2596be] shrink-0" />
                      <span className="font-extrabold text-slate-900 dark:text-white">{selectedJob.salary}</span>
                    </div>
                  </div>

                  {/* AI PO-FIT Match Badge */}
                  <div className="p-3.5 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800/80 border border-[#C2E5EF] dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-[#2596be] dark:text-cyan-400 font-extrabold">
                      <Sparkles size={16} />
                      <span>Analisis PO-FIT AI ({selectedJob.matchScore}% Match):</span>
                    </div>
                    <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                      {selectedJob.reason}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    {selectedJob.postedAgo}
                  </p>

                  {/* Action CTA Buttons Bar (Matching KitaLulus Primary Blue Button) */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {appliedJobs.includes(selectedJob.id) ? (
                      <span className="px-6 py-3 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xs sm:text-sm border border-emerald-300 flex items-center gap-2">
                        <CheckCircle2 size={16} /> Lamaran &amp; CV Terkirim
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyWithCv(selectedJob.id, selectedJob.company, selectedJob.title)}
                        className="px-7 py-3 rounded-2xl bg-[#2596be] hover:bg-[#1D7FA1] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Send size={16} />
                        <span>Lamar via PO-FIT AI</span>
                      </button>
                    )}

                    {/* Bookmark */}
                    <button
                      onClick={() => toggleSaveJob(selectedJob.id)}
                      className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                        savedJobIds.includes(selectedJob.id)
                          ? 'bg-cyan-50 border-[#2596be] text-[#2596be] dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                      title="Simpan Lowongan"
                    >
                      <Bookmark size={18} className={savedJobIds.includes(selectedJob.id) ? 'fill-current' : ''} />
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => alert(`Link lowongan "${selectedJob.title}" telah disalin!`)}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Bagikan"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Deskripsi Pekerjaan */}
                <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    Deskripsi Pekerjaan
                  </h3>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Dicari {selectedJob.title} dengan jobdesc:
                  </p>
                  <ul className="space-y-1.5 list-disc pl-5">
                    {selectedJob.descriptionBullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                </div>

                {/* Penempatan */}
                <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    Penempatan :
                  </h3>
                  <p className="font-medium text-slate-600 dark:text-slate-400">
                    {selectedJob.placementInfo}
                  </p>
                </div>

                {/* Kriteria / Kualifikasi */}
                <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                    KRITERIA / KUALIFIKASI :
                  </h3>
                  <ul className="space-y-1.5 list-disc pl-5 font-semibold text-slate-700 dark:text-slate-300">
                    {selectedJob.criteriaBullets.map((crit, idx) => (
                      <li key={idx}>{crit}</li>
                    ))}
                  </ul>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

export default function KitaLulusStyleCandidatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b7b9e]"></div></div>}>
      <DashboardContent />
    </Suspense>
  );
}
