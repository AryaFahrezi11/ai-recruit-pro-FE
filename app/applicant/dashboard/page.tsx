'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
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
  HelpCircle,
  Users,
  Copy,
  MessageCircle,
  Mail,
  Globe
} from 'lucide-react';
import { ApplyJobModal } from '@/components/ApplyJobModal';
import { api, parseErrorMessage } from '@/lib/api';

interface Job {
  id: number | string;
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
}

interface Company {
  id: number | string;
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
  const { t } = useTranslation();
  const initialView = searchParams.get('view') || 'recommended';

  const [activeTab, setActiveTab] = useState<'recommended' | 'companies' | 'saved'>(
    initialView === 'companies' ? 'companies' : initialView === 'saved' ? 'saved' : 'recommended'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [educationFilter, setEducationFilter] = useState('Semua');
  const [workPolicyFilter, setWorkPolicyFilter] = useState('Semua');

  // Currently selected job ID for the right side detail pane
  const [selectedJobId, setSelectedJobId] = useState<number | string>('');
  const [shareJob, setShareJob] = useState<Job | null>(null);

  const [cvDetails, setCvDetails] = useState<any>(null);
  const [appliedJobs, setAppliedJobs] = useState<(number | string)[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<(number | string)[]>([]);
  const [applyingJobModalData, setApplyingJobModalData] = useState<{ id: number | string; title: string; company: string } | null>(null);

  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [companiesList, setCompaniesList] = useState<Company[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);

  useEffect(() => {
    const savedEmail = localStorage.getItem('user_email') || 'pelamar@example.com';
    const derivedName = savedEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

    const savedCv = localStorage.getItem('candidateCvData');
    if (savedCv) {
      setCvDetails(JSON.parse(savedCv));
    } else {
      setCvDetails({
        fullName: formattedName,
        jobTitle: 'Pelamar AI Recruit Pro',
        skills: 'Frontend, Software Engineering, Problem Solving',
        summary: 'Seorang profesional yang berdedikasi tinggi dengan fokus pada problem solving dan pengembangan perangkat lunak modern.',
        experiences: [
          { role: 'Software Engineer', company: 'PT. Teknologi Masa Depan', period: '2022 - Sekarang', description: 'Mengembangkan aplikasi web responsif menggunakan Next.js dan TypeScript.' }
        ],
        education: [
          { school: 'Universitas Komputer Indonesia', degree: 'S1 Teknik Informatika', period: '2018 - 2022', gpa: '3.80' }
        ],
        updatedAt: 'Hari ini'
      });
    }

    const savedApplied = localStorage.getItem('appliedJobsList');
    if (savedApplied) {
      try { setAppliedJobs(JSON.parse(savedApplied)); } catch(e){}
    }

    const storedSaved = localStorage.getItem('candidateSavedJobsList');
    if (storedSaved) {
      try { setSavedJobIds(JSON.parse(storedSaved)); } catch(e){}
    }

    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    setIsLoadingJobs(true);
    try {
      // Fetch jobs and companies in parallel
      const [resJobs, resComp, resProfile] = await Promise.all([
        api.get('/jobs/?limit=100'),
        api.get('/perusahaan/verified'),
        api.get('/users/profile').catch(() => null)
      ]);

      const rawJobsList = Array.isArray(resJobs) ? resJobs : (resJobs?.data && Array.isArray(resJobs.data) ? resJobs.data : []);

      if (rawJobsList.length > 0) {
        const safeParseArray = (val: any) => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [val];
          } catch {
            return typeof val === 'string' ? val.split('\n').filter((s: string) => s.trim()) : [val];
          }
        };

        const mappedJobs: Job[] = rawJobsList.map((j: any) => {
          const benefitsArray = (() => {
            if (!j.benefits_json) return [];
            if (Array.isArray(j.benefits_json)) return j.benefits_json;
            try {
              const parsed = JSON.parse(j.benefits_json);
              return Array.isArray(parsed) ? parsed : [j.benefits_json];
            } catch {
              return typeof j.benefits_json === 'string' ? j.benefits_json.split(',').map((b: string) => b.trim()).filter(Boolean) : [];
            }
          })();

          const expLevel = (() => {
            const el = j.experience_level;
            if (el === 'Entry Level') return 'Entry Level (0 - 1 Tahun)';
            if (el === 'Mid Level') return 'Mid Level (2 - 4 Tahun)';
            if (el === 'Senior Level') return 'Senior Level (5+ Tahun)';
            if (el === 'Lead / Manager') return 'Lead / Manager (8+ Tahun)';
            return el || (j.pengalaman_min_tahun > 3 ? 'Senior Level (5+ Tahun)' : 'Mid Level (2 - 4 Tahun)');
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
            salary: (j.tampilkan_gaji && j.gaji_min && j.gaji_max) 
                    ? `Rp ${(j.gaji_min/1000000).toFixed(0)} Jt - Rp ${(j.gaji_max/1000000).toFixed(0)} Jt` 
                    : 'Gaji Dirahasiakan',
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
          };
        });

        setJobsList(mappedJobs);
        setSelectedJobId(mappedJobs[0].id);
      }

      const rawCompList = Array.isArray(resComp) ? resComp : (resComp?.data && Array.isArray(resComp.data) ? resComp.data : []);

      if (rawCompList.length > 0) {
        const mappedComp: Company[] = rawCompList.map((c: any) => ({
          id: c.id,
          name: c.nama_perusahaan,
          logo: (c.logo_url && c.logo_url !== '') 
                ? (c.logo_url.startsWith('http') ? c.logo_url : `http://${typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'}:8000${c.logo_url}`)
                : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
          industry: c.industri || 'Umum & Teknologi',
          location: c.kota || c.alamat || 'Indonesia',
          openJobsCount: c.jobs_count || c.open_jobs_count || 0,
          description: c.deskripsi || 'Perusahaan terverifikasi di platform AI Recruit Pro.'
        }));
        setCompaniesList(mappedComp);
      }

      if (resProfile && resProfile.profil) {
        const p = resProfile.profil;
        
        let parsedExp = [];
        if (p.pengalaman_kerja) {
          try {
            parsedExp = typeof p.pengalaman_kerja === 'string' ? JSON.parse(p.pengalaman_kerja) : p.pengalaman_kerja;
            if (!Array.isArray(parsedExp)) parsedExp = [];
          } catch (_) {}
        }
        
        let parsedEdu = [];
        if (p.riwayat_pendidikan) {
          try {
            parsedEdu = typeof p.riwayat_pendidikan === 'string' ? JSON.parse(p.riwayat_pendidikan) : p.riwayat_pendidikan;
            if (!Array.isArray(parsedEdu)) parsedEdu = [];
          } catch (_) {}
        }

        let parsedCert = [];
        if (p.sertifikasi) {
          try {
            parsedCert = typeof p.sertifikasi === 'string' ? JSON.parse(p.sertifikasi) : p.sertifikasi;
            if (!Array.isArray(parsedCert)) parsedCert = [];
          } catch (_) {
            if (p.sertifikasi.trim()) parsedCert = [{ name: p.sertifikasi, credentialUrl: '' }];
          }
        }

        let parsedSocial = [];
        if (p.social_links) {
          try {
            parsedSocial = typeof p.social_links === 'string' ? JSON.parse(p.social_links) : p.social_links;
            if (!Array.isArray(parsedSocial)) parsedSocial = [];
          } catch (_) {}
        }

        setCvDetails({
          fullName: p.nama_lengkap && p.nama_lengkap !== 'Nama Pelamar' ? p.nama_lengkap : (resProfile.email?.split('@')[0] || 'Pelamar'),
          jobTitle: p.judul_posisi || 'Pelamar AI Recruit Pro',
          email: resProfile.email || p.email,
          phone: p.no_telepon || '',
          location: p.alamat || '',
          linkedinUrl: p.linkedin_url || '',
          portfolioUrl: p.portfolio_url || '',
          socialLinks: parsedSocial,
          skills: p.keahlian || 'Belum ada skill yang ditambahkan',
          summary: p.ringkasan_diri || '',
          experiences: parsedExp,
          education: parsedEdu,
          certifications: parsedCert,
          updatedAt: 'Baru Saja'
        });
      }
    } catch (err) {
      console.error('Gagal mengambil data real dari backend:', err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'companies') setActiveTab('companies');
    else if (view === 'saved') setActiveTab('saved');
    else setActiveTab('recommended');
  }, [searchParams]);

  // Save Job Toggle
  const toggleSaveJob = async (jobId: any) => {
    let newSaved: any[];
    if (savedJobIds.includes(jobId) || savedJobIds.includes(String(jobId))) {
      newSaved = savedJobIds.filter((id) => String(id) !== String(jobId));
      setSavedJobIds(newSaved);
      localStorage.setItem('candidateSavedJobsList', JSON.stringify(newSaved));
      try {
        await api.delete(`/saved-jobs/${jobId}`);
      } catch (err) {
        console.error('Failed to unsave job:', err);
      }
    } else {
      newSaved = Array.from(new Set([...savedJobIds, jobId]));
      setSavedJobIds(newSaved);
      localStorage.setItem('candidateSavedJobsList', JSON.stringify(newSaved));
      try {
        await api.post(`/saved-jobs/${jobId}`);
      } catch (err) {
        console.error('Failed to save job:', err);
      }
    }
  };

  // Direct Apply Handler
  const handleApplyWithCv = (jobId: number | string, companyName: string, title: string) => {
    setApplyingJobModalData({
      id: jobId,
      title: title,
      company: companyName,
    });
  };

  const handleCopyLink = () => {
    if (!shareJob) return;
    const url = typeof window !== 'undefined' ? window.location.origin + '/jobs/' + shareJob.id : 'http://localhost:3000/jobs/' + shareJob.id;
    navigator.clipboard.writeText(url);
    toast.success('Link berhasil disalin ke clipboard!');
    setShareJob(null);
  };

  // Filter Jobs List
  const filteredJobs = useMemo(() => {
    return jobsList.filter((job) => {
      if (activeTab === 'saved') return savedJobIds.some(id => String(id) === String(job.id));

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
    return jobsList.find((j) => String(j.id) === String(selectedJobId)) || filteredJobs[0] || jobsList[0];
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
              placeholder={t.pelamar.dashboard.searchPlaceholder}
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
              placeholder={t.pelamar.dashboard.locationPlaceholder}
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
              <span>{t.pelamar.dashboard.searchButton}</span>
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
                onClick={() => router.push(`/applicant/companies/${comp.id}`)}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-[#2596be]/40 transition-all space-y-4 flex flex-col justify-between cursor-pointer group"
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
                    <h4 className="font-black text-lg text-slate-800 dark:text-white group-hover:text-[#2596be] transition-colors">
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

                <div
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 group-hover:border-[#2596be] group-hover:text-[#2596be] group-hover:bg-[#F0F8FB] dark:group-hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <span>Lihat {comp.openJobsCount} Lowongan Buka</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* DUAL-PANE KITALULUS SPLIT VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* RICH SOCIAL SHARE MODAL */}
          {shareJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 space-y-6">
                
                {/* Modal Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#E0F1F7] dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 flex items-center justify-center shrink-0">
                      <Share2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">Bagikan Lowongan Pekerjaan</h3>
                      <p className="text-xs text-slate-500 font-bold line-clamp-1">
                        {shareJob.title} • {shareJob.company}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShareJob(null)}
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Social Media Share Buttons Grid */}
                <div className="space-y-2">
                  <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Pilih Media Sosial untuk Berbagi:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* WhatsApp */}
                    <button
                      onClick={() => {
                        const url = typeof window !== 'undefined' ? window.location.origin + '/jobs/' + shareJob.id : '';
                        const text = `Lowongan Pekerjaan: ${shareJob.title} di ${shareJob.company}\n\nApply & lihat detail loker:\n${url}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageCircle size={20} />
                      </div>
                      <span>WhatsApp</span>
                    </button>

                    {/* Telegram */}
                    <button
                      onClick={() => {
                        const url = typeof window !== 'undefined' ? window.location.origin + '/jobs/' + shareJob.id : '';
                        const text = `Lowongan Pekerjaan: ${shareJob.title} di ${shareJob.company}`;
                        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-extrabold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Send size={20} />
                      </div>
                      <span>Telegram</span>
                    </button>

                    {/* LinkedIn */}
                    <button
                      onClick={() => {
                        const url = typeof window !== 'undefined' ? window.location.origin + '/jobs/' + shareJob.id : '';
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                      }}
                      className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-extrabold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Globe size={20} />
                      </div>
                      <span>LinkedIn</span>
                    </button>

                    {/* Email */}
                    <button
                      onClick={() => {
                        const url = typeof window !== 'undefined' ? window.location.origin + '/jobs/' + shareJob.id : '';
                        const subject = `Lowongan Pekerjaan: ${shareJob.title} di ${shareJob.company}`;
                        const body = `Halo,\n\nSaya ingin membagikan info lowongan pekerjaan berikut:\n\nPosisi: ${shareJob.title}\nPerusahaan: ${shareJob.company}\nLokasi: ${shareJob.location}\n\nLink detail & pendaftaran: ${url}`;
                        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mail size={20} />
                      </div>
                      <span>Email</span>
                    </button>
                  </div>
                </div>

                {/* Copy Link Input Bar */}
                <div className="space-y-2">
                  <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Atau Salin Tautan Link:
                  </p>
                  <div className="p-2 pl-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== 'undefined' ? window.location.origin + '/jobs/' + shareJob.id : ''}
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2.5 bg-[#2596be] hover:bg-[#1D7FA1] text-white text-xs font-black rounded-xl transition-all cursor-pointer shrink-0 shadow-sm flex items-center gap-1.5"
                    >
                      <Copy size={14} />
                      <span>Salin Link</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* LEFT COLUMN: SELECTABLE JOB CARDS LIST (~38% Width / 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Header info */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span>{t.pelamar.dashboard.title}</span>
                  <Info className="w-4 h-4 text-slate-400" />
                </h2>
                <p className="text-xs text-slate-500 font-semibold">
                  {filteredJobs.length} {t.pelamar.dashboard.jobMatchesFound}
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
                    {t.pelamar.dashboard.requirements}
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
                  const isSelected = String(selectedJob.id) === String(job.id);
                  const isSaved = savedJobIds.some(id => String(id) === String(job.id));

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
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="font-extrabold text-xs text-slate-700 dark:text-slate-300">
                                {job.company}
                              </span>
                              {job.isNew && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] border border-amber-200 dark:border-amber-800">
                                  Loker Terbaru
                                </span>
                              )}
                              {job.isPromoted && (
                                <span className="px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-extrabold text-[10px]">
                                  Dipromosikan
                                </span>
                              )}
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug hover:text-[#2596be] transition-colors">
                              {job.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Kuota Posisi Pill Badge */}
                      {job.openingsCount > 0 && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F1F7] dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 text-xs font-extrabold border border-[#B8E1ED] dark:border-slate-700">
                          <Users size={13} />
                          <span>Kuota: {job.openingsCount} Posisi</span>
                        </div>
                      )}

                      {/* Detail Bullet Badges */}
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400 shrink-0" />
                          <span>
                            <strong className="text-slate-800 dark:text-slate-200">{job.location}</strong> • {job.workPolicy} ({job.experienceLevel}) • {job.educationLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={14} className="text-[#2596be] shrink-0" />
                          <span className="font-black text-slate-900 dark:text-white text-sm">{job.salary}</span>
                        </div>
                      </div>

                      {/* Benefits Pills List */}
                      {job.benefits && job.benefits.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {job.benefits.slice(0, 4).map((b, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 rounded-full bg-[#F0F8FB] dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 text-[11px] font-bold border border-[#C2E5EF] dark:border-slate-700 flex items-center gap-1">
                              ✓ {b}
                            </span>
                          ))}
                          {job.benefits.length > 4 && (
                            <span className="text-[10px] font-bold text-slate-400">+{job.benefits.length - 4} lainnya</span>
                          )}
                        </div>
                      )}

                      {/* Card Bottom Time & Share/Bookmark */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <span className="text-slate-400 font-bold">
                          Diterbitkan: {job.publishDate} • {job.postedAgo}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveJob(job.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#2596be] transition-colors cursor-pointer"
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
                              setShareJob(job);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#2596be] transition-colors cursor-pointer"
                            title="Bagikan Lowongan"
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
          <div className="lg:col-span-7 sticky top-28 h-[calc(100vh-130px)]">
            {selectedJob && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-y-auto h-full custom-scrollbar">
                
                {/* Detail Header */}
                <div className="p-6 sm:p-8 pb-4 space-y-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedJob.logo}
                      alt={selectedJob.company}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-[#2596be] dark:text-cyan-400">
                          {selectedJob.company}
                        </span>
                        {selectedJob.isNew && (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs border border-amber-200 dark:border-amber-800">
                            Loker Terbaru
                          </span>
                        )}
                        {selectedJob.isPromoted && (
                          <span className="px-2.5 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-extrabold text-xs">
                            Dipromosikan
                          </span>
                        )}
                      </div>

                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {selectedJob.title}
                      </h1>

                      {selectedJob.openingsCount > 0 && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E0F1F7] dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 text-xs font-extrabold border border-[#B8E1ED] dark:border-slate-700">
                          <Users size={13} />
                          <span>Kuota Terbuka: {selectedJob.openingsCount} Posisi</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Grid Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold pt-1">
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <MapPin size={16} className="text-[#2596be] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Lokasi Penempatan</p>
                        <p className="font-extrabold">{selectedJob.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <GraduationCap size={16} className="text-[#2596be] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Min. Pendidikan</p>
                        <p className="font-extrabold">{selectedJob.educationLevel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <Briefcase size={16} className="text-[#2596be] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Kebijakan & Tipe Kerja</p>
                        <p className="font-extrabold">{selectedJob.workPolicy}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <Award size={16} className="text-[#2596be] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Level Pengalaman</p>
                        <p className="font-extrabold">{selectedJob.experienceLevel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <DollarSign size={16} className="text-[#2596be] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Rentang Gaji</p>
                        <p className="font-black text-[#2596be] dark:text-cyan-400 text-sm">{selectedJob.salary}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <Clock size={16} className="text-[#2596be] shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Batas Akhir Lamaran</p>
                        <p className="font-extrabold">{selectedJob.applicationDeadline || 'Tidak ditentukan'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Benefits Pills */}
                  {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Fasilitas &amp; Benefit Pekerjaan:</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {selectedJob.benefits.map((benefit, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-[#F0F8FB] dark:bg-slate-800 text-[#2596be] dark:text-cyan-400 text-xs font-extrabold border border-[#C2E5EF] dark:border-slate-700 flex items-center gap-1">
                            ✓ {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 font-bold italic">
                    Diterbitkan: {selectedJob.publishDate} • {selectedJob.postedAgo}
                  </p>

                  {/* Action CTA Buttons Bar (Matching KitaLulus Primary Blue Button) */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {appliedJobs.some(id => String(id) === String(selectedJob.id)) ? (
                      <span className="px-6 py-3 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xs sm:text-sm border border-emerald-300 flex items-center gap-2">
                        <CheckCircle2 size={16} /> {t.pelamar.dashboard.jobSaved}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyWithCv(selectedJob.id, selectedJob.company, selectedJob.title)}
                        className="px-7 py-3 rounded-2xl bg-[#2596be] hover:bg-[#1D7FA1] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Send size={16} />
                        <span>{t.pelamar.dashboard.applyNow}</span>
                      </button>
                    )}

                    {/* Bookmark */}
                    <button
                      onClick={() => toggleSaveJob(selectedJob.id)}
                      className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                        savedJobIds.some(id => String(id) === String(selectedJob.id))
                          ? 'bg-cyan-50 border-[#2596be] text-[#2596be] dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                      title="Simpan Lowongan"
                    >
                      <Bookmark size={18} className={savedJobIds.some(id => String(id) === String(selectedJob.id)) ? 'fill-current' : ''} />
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => setShareJob(selectedJob)}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                      title="Bagikan Lowongan"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Description Content */}
                <div className="p-6 sm:p-8 pt-6 space-y-6">
                  {/* Deskripsi Pekerjaan */}
                  <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      {t.pelamar.dashboard.aboutRole}
                    </h3>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Gambaran Umum &amp; Deskripsi Pekerjaan:
                    </p>
                    <ul className="space-y-1.5 list-disc pl-5">
                      {selectedJob.descriptionBullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Tanggung Jawab Pekerjaan */}
                  {selectedJob.responsibilitiesBullets && selectedJob.responsibilitiesBullets.length > 0 && (
                    <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                        Tanggung Jawab Utama
                      </h3>
                      <ul className="space-y-1.5 list-disc pl-5 font-semibold text-slate-700 dark:text-slate-300">
                        {selectedJob.responsibilitiesBullets.map((resp, idx) => (
                          <li key={idx}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Kriteria / Kualifikasi */}
                  <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      {t.pelamar.dashboard.requirements}
                    </h3>
                    <ul className="space-y-1.5 list-disc pl-5 font-semibold text-slate-700 dark:text-slate-300">
                      {selectedJob.criteriaBullets.map((crit, idx) => (
                        <li key={idx}>{crit}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Informasi Lokasi & Penempatan */}
                  <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      Lokasi Penempatan
                    </h3>
                    <p className="font-medium text-slate-600 dark:text-slate-400">
                      {selectedJob.placementInfo}
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* Apply Job Modal */}
      {applyingJobModalData && (
        <ApplyJobModal
          job={applyingJobModalData}
          cvData={cvDetails}
          onClose={() => setApplyingJobModalData(null)}
          onSuccess={() => {
            router.push('/applicant/status');
          }}
        />
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
