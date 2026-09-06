'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
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
  RefreshCw,
  Award,
  Zap,
  HelpCircle,
  Users,
  Copy,
  MessageCircle,
  Mail,
  Globe,
  Loader2
} from 'lucide-react';
import { ApplyJobModal } from '@/components/ApplyJobModal';
import { api, parseErrorMessage, getMediaUrl } from '@/lib/api';

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
  createdAtMs: number;
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
  const { t, language } = useTranslation();
  const initialView = searchParams.get('view') || 'recommended';

  const [activeTab, setActiveTab] = useState<'recommended' | 'companies' | 'saved'>(
    initialView === 'companies' ? 'companies' : initialView === 'saved' ? 'saved' : 'recommended'
  );

  // Search & Location
  const [searchQuery, setSearchQuery] = useState(searchParams.get('keyword') || searchParams.get('search') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');
  const [suggestedLocations, setSuggestedLocations] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationContainerRef = useRef<HTMLDivElement>(null);

  // 5 Job Filters (matching Employer Job Posting)
  const [categories, setCategories] = useState<Array<{ id: string; nama_kategori: string }>>([]);
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('kategori_id') || 'Semua');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState(searchParams.get('tipe_pekerjaan') || 'Semua');
  const [workModeFilter, setWorkModeFilter] = useState(searchParams.get('lokasi_kerja') || 'Semua');
  const [experienceFilter, setExperienceFilter] = useState(searchParams.get('experience_level') || 'Semua');
  const [educationFilter, setEducationFilter] = useState(searchParams.get('pendidikan_min') || 'Semua');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort') || 'rekomendasi');
  const [userHasCv, setUserHasCv] = useState<boolean>(true);

  // Industry filter (for Companies tab)
  const [industryFilter, setIndustryFilter] = useState(searchParams.get('industry') || 'Semua');
  const [isSearching, setIsSearching] = useState(false);
  const activeFetchId = useRef(0);
  const isFormSubmittingRef = useRef(false);

  const switchTab = (newTab: 'recommended' | 'companies' | 'saved') => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    if (newTab === 'companies') {
      params.set('view', 'companies');
    } else if (newTab === 'saved') {
      params.set('view', 'saved');
    } else {
      params.delete('view');
    }
    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : '/applicant/dashboard', { scroll: false });
  };

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

  // Currently selected job ID for the right side detail pane
  const urlJobId = searchParams.get('jobId');
  const [selectedJobId, setSelectedJobId] = useState<number | string>(urlJobId || '');
  const [shareJob, setShareJob] = useState<Job | null>(null);

  const [cvDetails, setCvDetails] = useState<any>(null);
  const [appliedJobs, setAppliedJobs] = useState<(number | string)[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<(number | string)[]>([]);
  const [applyingJobModalData, setApplyingJobModalData] = useState<{ id: number | string; title: string; company: string } | null>(null);

  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [companiesList, setCompaniesList] = useState<Company[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(true);

  // Close location dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationContainerRef.current && !locationContainerRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Synchronize filter input states with URL search params
  useEffect(() => {
    setSearchQuery(searchParams.get('keyword') || searchParams.get('search') || '');
    setLocationQuery(searchParams.get('location') || '');
    setCategoryFilter(searchParams.get('kategori_id') || 'Semua');
    setEmploymentTypeFilter(searchParams.get('tipe_pekerjaan') || 'Semua');
    setWorkModeFilter(searchParams.get('lokasi_kerja') || 'Semua');
    setExperienceFilter(searchParams.get('experience_level') || 'Semua');
    setEducationFilter(searchParams.get('pendidikan_min') || 'Semua');
    const paramSort = searchParams.get('sort');
    if (paramSort) {
      setSortOrder(paramSort);
    } else {
      setSortOrder(userHasCv ? 'rekomendasi' : 'terbaru');
    }
    setIndustryFilter(searchParams.get('industry') || 'Semua');
  }, [searchParams, userHasCv]);

  // 1. Initial Load: Auxiliary filters, profile, verified companies, applications, saved jobs (runs once on mount)
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
      try { setAppliedJobs(JSON.parse(savedApplied)); } catch (e) { }
    }

    const storedSaved = localStorage.getItem('candidateSavedJobsList');
    if (storedSaved) {
      try { setSavedJobIds(JSON.parse(storedSaved)); } catch (e) { }
    }

    const loadInitialData = async () => {
      try {
        const [locRes, catRes, resComp, resProfile, resApps] = await Promise.all([
          api.get('/jobs/locations').catch(() => null),
          api.get('/jobs/categories').catch(() => null),
          api.get('/perusahaan/verified').catch(() => null),
          api.get('/users/profile').catch(() => null),
          api.get('/applications/').catch(() => null)
        ]);

        if (locRes?.locations && Array.isArray(locRes.locations)) {
          setSuggestedLocations(locRes.locations);
        }
        if (Array.isArray(catRes)) {
          setCategories(catRes);
        } else if (catRes?.data && Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }

        const rawCompList = Array.isArray(resComp) ? resComp : (resComp?.data && Array.isArray(resComp.data) ? resComp.data : []);
        if (rawCompList.length > 0) {
          const mappedComp: Company[] = rawCompList.map((c: any) => ({
            id: c.id,
            name: c.nama_perusahaan,
            logo: (c.logo_url && c.logo_url !== '')
              ? getMediaUrl(c.logo_url)
              : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
            industry: c.industri || 'Umum & Teknologi',
            location: c.kota || c.alamat || 'Indonesia',
            openJobsCount: c.jobs_count || c.open_jobs_count || 0,
            description: c.deskripsi || 'Perusahaan terverifikasi di platform AI Recruit Pro.'
          }));
          setCompaniesList(mappedComp);
        }

        if (resApps) {
          const rawList = Array.isArray(resApps) ? resApps : (resApps?.data || []);
          const appliedIds = rawList.map((app: any) => String(app.job_id || app.job?.id || '')).filter(Boolean);
          setAppliedJobs(appliedIds);
          localStorage.setItem('appliedJobsList', JSON.stringify(appliedIds));
        }

        if (resProfile && resProfile.profil) {
          const p = resProfile.profil;

          let parsedExp = [];
          if (p.pengalaman_kerja) {
            try {
              parsedExp = typeof p.pengalaman_kerja === 'string' ? JSON.parse(p.pengalaman_kerja) : p.pengalaman_kerja;
              if (!Array.isArray(parsedExp)) parsedExp = [];
            } catch (_) { }
          }

          let parsedEdu = [];
          if (p.riwayat_pendidikan) {
            try {
              parsedEdu = typeof p.riwayat_pendidikan === 'string' ? JSON.parse(p.riwayat_pendidikan) : p.riwayat_pendidikan;
              if (!Array.isArray(parsedEdu)) parsedEdu = [];
            } catch (_) { }
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
            } catch (_) { }
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
            skills: p.keahlian || (language === 'id' ? 'Belum ada skill yang ditambahkan' : 'No skills added yet'),
            summary: p.ringkasan_diri || '',
            experiences: parsedExp,
            education: parsedEdu,
            certifications: parsedCert,
            updatedAt: language === 'id' ? 'Baru Saja' : 'Just Now'
          });
        }
      } catch (err) {
        console.error("Gagal memuat data awal:", err);
      }
    };

    loadInitialData();
  }, [language]);

  // 2. Dedicated function to fetch jobs (fast & responsive)
  const fetchJobsData = async (queryOverride?: Record<string, string>) => {
    const fetchId = ++activeFetchId.current;
    setIsLoadingJobs(true);
    try {
      const apiParams = new URLSearchParams();
      apiParams.append('limit', '100');

      const kw = queryOverride?.keyword !== undefined ? queryOverride.keyword : (searchParams.get('keyword') || searchParams.get('search'));
      const loc = queryOverride?.location !== undefined ? queryOverride.location : searchParams.get('location');
      const cat = queryOverride?.kategori_id !== undefined ? queryOverride.kategori_id : searchParams.get('kategori_id');
      const emp = queryOverride?.tipe_pekerjaan !== undefined ? queryOverride.tipe_pekerjaan : searchParams.get('tipe_pekerjaan');
      const wm = queryOverride?.lokasi_kerja !== undefined ? queryOverride.lokasi_kerja : searchParams.get('lokasi_kerja');
      const exp = queryOverride?.experience_level !== undefined ? queryOverride.experience_level : searchParams.get('experience_level');
      const edu = queryOverride?.pendidikan_min !== undefined ? queryOverride.pendidikan_min : searchParams.get('pendidikan_min');
      const sort = queryOverride?.sort !== undefined ? queryOverride.sort : (searchParams.get('sort') || sortOrder || 'rekomendasi');

      if (kw && kw.trim()) apiParams.append('keyword', kw.trim());
      if (loc && loc !== 'Semua' && loc.trim()) apiParams.append('location', loc.trim());
      if (cat && cat !== 'Semua') apiParams.append('kategori_id', cat);
      if (emp && emp !== 'Semua') apiParams.append('tipe_pekerjaan', emp);
      if (wm && wm !== 'Semua') apiParams.append('lokasi_kerja', wm);
      if (exp && exp !== 'Semua') apiParams.append('experience_level', exp);
      if (edu && edu !== 'Semua') apiParams.append('pendidikan_min', edu);
      if (sort) apiParams.append('sort_by', sort);

      const qs = apiParams.toString();
      const resJobs = await api.get(`/jobs/?${qs}`);

      if (fetchId !== activeFetchId.current) return;

      if (resJobs && typeof resJobs.user_has_cv === 'boolean') {
        const hasCv = resJobs.user_has_cv;
        setUserHasCv(hasCv);
        if (!hasCv && (!searchParams.get('sort') || searchParams.get('sort') === 'rekomendasi')) {
          setSortOrder('terbaru');
        }
      }

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
            if (diffDays <= 0) return language === 'id' ? 'Hari ini' : 'Today';
            if (diffDays === 1) return language === 'id' ? '1 hari yang lalu' : '1 day ago';
            return language === 'id' ? `${diffDays} hari yang lalu` : `${diffDays} days ago`;
          })();

          const isNewJob = diffDays >= 0 && diffDays <= 7;

          return {
            id: j.id,
            title: j.judul_posisi,
            company: j.perusahaan?.nama_perusahaan || 'Perusahaan',
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
            salary: (j.tampilkan_gaji && j.gaji_min && j.gaji_max)
              ? `Rp ${(j.gaji_min / 1000000).toFixed(0)} Jt - Rp ${(j.gaji_max / 1000000).toFixed(0)} Jt`
              : (language === 'id' ? 'Gaji Dirahasiakan' : 'Salary Undisclosed'),
            postedAgo: postedAgoText,
            publishDate: createdDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            applicationDeadline: j.tanggal_tutup ? new Date(j.tanggal_tutup).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null,
            isPromoted: j.is_promoted || false,
            isNew: isNewJob,
            matchScore: j.match_score || 92,
            createdAtMs: createdDate.getTime(),
            reason: j.reason || (language === 'id' ? 'Keahlian & kualifikasi Anda sesuai dengan posisi ini.' : 'Your skills and qualifications match this role.'),
            descriptionBullets: safeParseArray(j.deskripsi_pekerjaan),
            responsibilitiesBullets: safeParseArray(j.tanggung_jawab),
            placementInfo: j.kota ? (language === 'id' ? `Untuk lokasi di ${j.kota}` : `Located in ${j.kota}`) : (j.lokasi_kerja === 'remote' ? (language === 'id' ? 'Remote (Kerja Dari Mana Saja)' : 'Remote (Work From Anywhere)') : (language === 'id' ? 'Lokasi Perusahaan' : 'Company Location')),
            criteriaBullets: safeParseArray(j.kualifikasi),
          };
        });

        setJobsList(mappedJobs);
        if (urlJobId && mappedJobs.some(j => String(j.id) === String(urlJobId))) {
          setSelectedJobId(urlJobId);
        } else if (mappedJobs.length > 0) {
          setSelectedJobId(mappedJobs[0].id);
        }
      } else {
        setJobsList([]);
      }
    } catch (err) {
      console.error('Gagal mengambil data jobs:', err);
      setJobsList([]);
    } finally {
      if (fetchId === activeFetchId.current) {
        setIsLoadingJobs(false);
      }
    }
  };

  // 3. Synchronize active tab and fetch jobs whenever URL search params change
  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'companies') {
      setActiveTab('companies');
    } else if (view === 'saved') {
      setActiveTab('saved');
    } else {
      setActiveTab('recommended');
    }

    if (!isFormSubmittingRef.current) {
      fetchJobsData();
    }
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
    toast.success(language === 'id' ? 'Link berhasil disalin ke clipboard!' : 'Link copied to clipboard!');
    setShareJob(null);
  };

  // Filter Jobs List
  const filteredJobs = useMemo(() => {
    if (activeTab === 'saved') {
      return jobsList.filter((job) => savedJobIds.some(id => String(id) === String(job.id)));
    }
    return jobsList;
  }, [jobsList, savedJobIds, activeTab]);

  const filteredCompanies = useMemo(() => {
    return companiesList.filter((comp) => {
      const matchesSearch = !searchQuery ||
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.industry.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation = !locationQuery || comp.location.toLowerCase().includes(locationQuery.toLowerCase());
      const matchesIndustry = industryFilter === 'Semua' || comp.industry.toLowerCase().includes(industryFilter.toLowerCase());

      return matchesSearch && matchesLocation && matchesIndustry;
    });
  }, [companiesList, searchQuery, locationQuery, industryFilter]);

  // Selected Job Details Object for Right Pane
  const selectedJob = useMemo(() => {
    return jobsList.find((j) => String(j.id) === String(selectedJobId)) || filteredJobs[0] || jobsList[0];
  }, [jobsList, selectedJobId, filteredJobs]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">

      {/* TOP SEARCH BANNER (Enterprise Solid Blue) */}
      <div className="bg-[#1A4B9F] rounded-2xl p-6 sm:p-8 text-white shadow-md space-y-5">
        <form
          method="GET"
          onSubmit={async (e) => {
            e.preventDefault();
            setShowLocationSuggestions(false);
            setIsSearching(true);
            isFormSubmittingRef.current = true;

            const updates: Record<string, string> = {
              keyword: searchQuery,
              location: locationQuery,
              kategori_id: categoryFilter,
              tipe_pekerjaan: employmentTypeFilter,
              lokasi_kerja: workModeFilter,
              experience_level: experienceFilter,
              pendidikan_min: educationFilter,
              sort: sortOrder,
            };

            updateUrlParams(updates);

            if (activeTab !== 'companies') {
              setActiveTab('recommended');
            }

            try {
              await fetchJobsData(updates);
            } finally {
              setIsSearching(false);
              setTimeout(() => {
                isFormSubmittingRef.current = false;
              }, 600);
            }
          }}
          className="grid grid-cols-1 md:grid-cols-12 gap-3"
        >
          {/* Left Input: Keyword */}
          <div className="md:col-span-5 relative flex items-center">
            <Search className="absolute left-4 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              name="keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'companies' ? (language === 'id' ? 'Cari nama perusahaan atau industri...' : 'Search company or industry...') : t.pelamar.dashboard.searchPlaceholder}
              className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-800 rounded-2xl text-sm font-semibold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1A4B9F] shadow-inner"
            />
          </div>

          {/* Right Input: Location with Suggestions */}
          <div className="md:col-span-5 relative flex items-center" ref={locationContainerRef}>
            <MapPin className="absolute left-4 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              name="location"
              value={locationQuery}
              onFocus={() => setShowLocationSuggestions(true)}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setShowLocationSuggestions(true);
              }}
              placeholder={t.pelamar.dashboard.locationPlaceholder}
              className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-800 rounded-2xl text-sm font-semibold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1A4B9F] shadow-inner"
            />
            {/* Location Suggestions Dropdown */}
            {showLocationSuggestions && suggestedLocations.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 max-h-60 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100">
                  <span>{language === 'id' ? 'Lokasi Sering Dicari' : 'Suggested Locations'}</span>
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-slate-700" onClick={() => setShowLocationSuggestions(false)} />
                </div>
                {suggestedLocations
                  .filter(loc => !locationQuery || loc.toLowerCase().includes(locationQuery.toLowerCase()))
                  .map((loc, idx) => (
                    <div
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setLocationQuery(loc);
                        setShowLocationSuggestions(false);
                        updateUrlParams({ location: loc });
                      }}
                      className="px-4 py-2.5 hover:bg-blue-50 text-xs font-semibold cursor-pointer flex items-center gap-2.5 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#1A4B9F]" />
                      <span>{loc}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="md:col-span-2 flex justify-center md:block">
            <button
              type="submit"
              disabled={isSearching}
              className="w-auto md:w-full px-6 py-2.5 md:py-3.5 bg-white/20 hover:bg-white/30 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed text-white rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 border border-white/30 transition-all shadow-sm cursor-pointer text-xs md:text-sm"
            >
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin shrink-0 text-white" />
              ) : (
                <Search className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
              )}
              <span>{isSearching ? (language === 'id' ? 'Mencari...' : 'Searching...') : (language === 'id' ? 'Cari' : 'Search')}</span>
            </button>
          </div>
        </form>

        {/* Mobile View Switcher (Cari Pekerjaan vs Perusahaan) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/20 rounded-xl sm:hidden w-full text-xs font-bold">
          <button
            type="button"
            onClick={() => switchTab('recommended')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab !== 'companies'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{t.pelamar.nav.findJobs}</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('companies')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'companies'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t.pelamar.nav.companies} ({companiesList.length})</span>
          </button>
        </div>

        {/* 5 Filters Matching Employer Job Posting + Reset Button */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 pt-1 text-xs w-full">
          {/* Reset Filters */}
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setLocationQuery('');
              setCategoryFilter('Semua');
              setEmploymentTypeFilter('Semua');
              setWorkModeFilter('Semua');
              setExperienceFilter('Semua');
              setEducationFilter('Semua');
              setIndustryFilter('Semua');
              updateUrlParams({
                keyword: '',
                location: '',
                kategori_id: 'Semua',
                tipe_pekerjaan: 'Semua',
                lokasi_kerja: 'Semua',
                experience_level: 'Semua',
                pendidikan_min: 'Semua',
                industry: 'Semua'
              });
            }}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl sm:rounded-full bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            title="Reset semua filter ke default"
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{language === 'id' ? 'Semua Filter' : 'All Filters'}</span>
          </button>

          {activeTab === 'companies' ? (
            <select
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                updateUrlParams({ industry: e.target.value });
              }}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl sm:rounded-full bg-white/15 hover:bg-white/25 text-white font-bold border border-white/30 outline-none cursor-pointer text-xs truncate"
            >
              <option className="text-slate-800" value="Semua">{language === 'id' ? 'Semua Industri' : 'All Industries'}</option>
              <option className="text-slate-800" value="Teknologi">{language === 'id' ? 'Teknologi & IT' : 'Tech & IT'}</option>
              <option className="text-slate-800" value="Keuangan">{language === 'id' ? 'Keuangan & Perbankan' : 'Finance & Banking'}</option>
              <option className="text-slate-800" value="Kesehatan">{language === 'id' ? 'Kesehatan' : 'Healthcare'}</option>
              <option className="text-slate-800" value="Pendidikan">{language === 'id' ? 'Pendidikan' : 'Education'}</option>
              <option className="text-slate-800" value="Manufaktur">{language === 'id' ? 'Manufaktur' : 'Manufacturing'}</option>
            </select>
          ) : (
            <>
              {/* 1. Filter Kategori Pekerjaan (from database) */}
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  updateUrlParams({ kategori_id: e.target.value });
                }}
                className="w-full sm:w-auto sm:max-w-[190px] px-3.5 py-2 rounded-xl sm:rounded-full bg-white/15 hover:bg-white/25 text-white font-bold border border-white/30 outline-none cursor-pointer text-xs truncate"
              >
                <option className="text-slate-800" value="Semua">{language === 'id' ? 'Semua Kategori' : 'All Categories'}</option>
                {categories.map((cat) => (
                  <option key={cat.id} className="text-slate-800" value={cat.id}>
                    {cat.nama_kategori}
                  </option>
                ))}
              </select>

              {/* 2. Filter Jenis Pekerjaan */}
              <select
                value={employmentTypeFilter}
                onChange={(e) => {
                  setEmploymentTypeFilter(e.target.value);
                  updateUrlParams({ tipe_pekerjaan: e.target.value });
                }}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl sm:rounded-full bg-white/15 hover:bg-white/25 text-white font-bold border border-white/30 outline-none cursor-pointer text-xs truncate"
              >
                <option className="text-slate-800" value="Semua">{language === 'id' ? 'Jenis Pekerjaan' : 'Job Type'}</option>
                <option className="text-slate-800" value="Full-time">Full-time</option>
                <option className="text-slate-800" value="Contract">Contract</option>
                <option className="text-slate-800" value="Part-time">Part-time</option>
                <option className="text-slate-800" value="Internship">Internship</option>
                <option className="text-slate-800" value="Freelance">Freelance</option>
              </select>

              {/* 3. Filter Mode Kerja */}
              <select
                value={workModeFilter}
                onChange={(e) => {
                  setWorkModeFilter(e.target.value);
                  updateUrlParams({ lokasi_kerja: e.target.value });
                }}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl sm:rounded-full bg-white/15 hover:bg-white/25 text-white font-bold border border-white/30 outline-none cursor-pointer text-xs truncate"
              >
                <option className="text-slate-800" value="Semua">{language === 'id' ? 'Mode Kerja' : 'Work Mode'}</option>
                <option className="text-slate-800" value="Hybrid">Hybrid</option>
                <option className="text-slate-800" value="Remote">Remote</option>
                <option className="text-slate-800" value="On-site">On-site</option>
              </select>

              {/* 4. Filter Tingkat Pengalaman (Tahunnya saja sesuai instruksi user) */}
              <select
                value={experienceFilter}
                onChange={(e) => {
                  setExperienceFilter(e.target.value);
                  updateUrlParams({ experience_level: e.target.value });
                }}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl sm:rounded-full bg-white/15 hover:bg-white/25 text-white font-bold border border-white/30 outline-none cursor-pointer text-xs truncate"
              >
                <option className="text-slate-800" value="Semua">{language === 'id' ? 'Tingkat Pengalaman' : 'Experience'}</option>
                <option className="text-slate-800" value="0 - 1 Tahun">0 - 1 Tahun</option>
                <option className="text-slate-800" value="2 - 4 Tahun">2 - 4 Tahun</option>
                <option className="text-slate-800" value="5+ Tahun">5+ Tahun</option>
                <option className="text-slate-800" value="8+ Tahun">8+ Tahun</option>
              </select>

              {/* 5. Filter Min. Pendidikan */}
              <select
                value={educationFilter}
                onChange={(e) => {
                  setEducationFilter(e.target.value);
                  updateUrlParams({ pendidikan_min: e.target.value });
                }}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl sm:rounded-full bg-white/15 hover:bg-white/25 text-white font-bold border border-white/30 outline-none cursor-pointer text-xs truncate"
              >
                <option className="text-slate-800" value="Semua">{language === 'id' ? 'Min. Pendidikan' : 'Min. Education'}</option>
                <option className="text-slate-800" value="SMA/SMK">SMA / SMK Sederajat</option>
                <option className="text-slate-800" value="D3">D3</option>
                <option className="text-slate-800" value="S1">S1</option>
                <option className="text-slate-800" value="S2">S2</option>
                <option className="text-slate-800" value="S3">S3</option>
              </select>
            </>
          )}

          {/* Desktop View Switcher */}
          <div className="ml-auto hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => switchTab('recommended')}
              className={`px-4 py-2 rounded-full font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab !== 'companies'
                  ? 'bg-[#EFF6FF] text-slate-900 border-[#DBEAFE] font-semibold'
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/30'
                }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>{t.pelamar.nav.findJobs}</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('companies')}
              className={`px-4 py-2 rounded-full font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'companies'
                  ? 'bg-[#EFF6FF] text-slate-900 border-[#DBEAFE] font-semibold'
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/30'
                }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t.pelamar.nav.companies} ({companiesList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* DUAL-PANE SPLIT VIEW MAIN CONTAINER (Matching KitaLulus Screenshot) */}
      {activeTab === 'companies' ? (
        /* COMPANIES LIST VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCompanies.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <p className="text-slate-500 font-semibold">{language === 'id' ? 'Tidak ada perusahaan yang sesuai dengan pencarian Anda.' : 'No companies match your search.'}</p>
              </div>
            ) : (
              filteredCompanies.map((comp) => (
                <div
                key={comp.id}
                onClick={() => router.push(`/applicant/companies/${comp.id}`)}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-[#1A4B9F]/40 transition-all space-y-4 flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <img
                      src={comp.logo}
                      alt={comp.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <span className="px-3 py-1 rounded-full bg-[#EFF6FF] dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs border border-[#DBEAFE] dark:border-slate-700">
                      {comp.openJobsCount} {language === 'id' ? 'Lowongan Buka' : 'Open Jobs'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-slate-900 transition-colors">
                      {comp.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-bold">
                      {comp.industry} • {comp.location}
                    </p>
                  </div>

                  <div
                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 group-hover:border-[#1A4B9F] group-hover:text-[#1A4B9F] group-hover:bg-[#EFF6FF] dark:group-hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span>{language === 'id' ? 'Lihat' : 'View'} {comp.openJobsCount} {language === 'id' ? 'Lowongan Buka' : 'Open Jobs'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

              </div>
            )))}
          </div>
        </div>
      ) : (
        /* DUAL-PANE KITALULUS SPLIT VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* RICH SOCIAL SHARE MODAL */}
          {shareJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative border border-slate-200 dark:border-slate-800 space-y-6">
                
                {/* Modal Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center shrink-0">
                      <Share2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{language === 'id' ? 'Bagikan Lowongan Pekerjaan' : 'Share Job Opening'}</h3>
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
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {language === 'id' ? 'Pilih Media Sosial untuk Berbagi:' : 'Choose Social Media to Share:'}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* WhatsApp */}
                    <button
                      onClick={() => {
                        const url = typeof window !== 'undefined' ? window.location.origin + '/jobs/' + shareJob.id : '';
                        const text = language === 'id'
                          ? `Lowongan Pekerjaan: ${shareJob.title} di ${shareJob.company}\n\nApply & lihat detail loker:\n${url}`
                          : `Job Opening: ${shareJob.title} at ${shareJob.company}\n\nApply & view job details:\n${url}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer group shadow-2xs"
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
                        const text = language === 'id' ? `Lowongan Pekerjaan: ${shareJob.title} di ${shareJob.company}` : `Job Opening: ${shareJob.title} at ${shareJob.company}`;
                        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-semibold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer group shadow-2xs"
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
                      className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer group shadow-2xs"
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
                        const subject = language === 'id' ? `Lowongan Pekerjaan: ${shareJob.title} di ${shareJob.company}` : `Job Opening: ${shareJob.title} at ${shareJob.company}`;
                        const body = language === 'id' 
                          ? `Halo,\n\nSaya ingin membagikan info lowongan pekerjaan berikut:\n\nPosisi: ${shareJob.title}\nPerusahaan: ${shareJob.company}\nLokasi: ${shareJob.location}\n\nLink detail & pendaftaran: ${url}`
                          : `Hello,\n\nI would like to share the following job opening:\n\nPosition: ${shareJob.title}\nCompany: ${shareJob.company}\nLocation: ${shareJob.location}\n\nApply & view job details: ${url}`;
                        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                      }}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer group shadow-2xs"
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
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {language === 'id' ? 'Atau Salin Tautan Link:' : 'Or Copy Link:'}
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
                      className="px-4 py-2.5 bg-[#1A4B9F] hover:bg-[#133878] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-sm flex items-center gap-1.5"
                    >
                      <Copy size={14} />
                      <span>{language === 'id' ? 'Salin Link' : 'Copy Link'}</span>
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
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span>{t.pelamar.dashboard.title}</span>
                  <Info className="w-4 h-4 text-slate-400" />
                </h2>
                <p className="text-xs text-slate-500 font-semibold">
                  {filteredJobs.length} {t.pelamar.dashboard.jobMatchesFound}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                <span>{language === 'id' ? 'Urutkan:' : 'Sort by:'}</span>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'rekomendasi' && !userHasCv) {
                      toast(
                        language === 'id'
                          ? 'Lengkapi profil / CV Anda terlebih dahulu untuk mengaktifkan rekomendasi PO-Fit.'
                          : 'Please complete your profile / CV first to enable PO-Fit recommendation.',
                        { icon: 'ℹ️' }
                      );
                      router.push('/applicant/profile');
                      return;
                    }
                    setSortOrder(val);
                    updateUrlParams({ sort: val });
                  }}
                  className="text-slate-900 dark:text-slate-100 font-bold cursor-pointer bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 outline-none hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
                >
                  <option
                    className="text-slate-800 dark:text-slate-200 font-medium"
                    value="rekomendasi"
                    disabled={!userHasCv}
                  >
                    {language === 'id'
                      ? (!userHasCv ? 'Rekomendasi PO-FIT (Perlu CV)' : 'Rekomendasi PO-FIT')
                      : (!userHasCv ? 'PO-FIT Recommendation (Needs CV)' : 'PO-FIT Recommendation')}
                  </option>
                  <option className="text-slate-800 dark:text-slate-200 font-medium" value="terbaru">
                    {language === 'id' ? 'Terbaru' : 'Newest'}
                  </option>
                  <option className="text-slate-800 dark:text-slate-200 font-medium" value="terlama">
                    {language === 'id' ? 'Terlama' : 'Oldest'}
                  </option>
                </select>
              </div>
            </div>

            {/* Incomplete CV Banner / Fallback Info */}
            {!userHasCv && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-[11px] leading-relaxed">
                    {language === 'id'
                      ? 'Profil / CV Anda belum lengkap. Rekomendasi diurutkan dari yang terbaru. Lengkapi CV untuk mencocokkan lowongan dengan keahlian Anda.'
                      : 'Your CV profile is incomplete. Showing newest jobs first. Complete your CV to unlock personalized PO-Fit matching.'}
                  </p>
                </div>
                <Link
                  href="/applicant/profile"
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-xl shrink-0 transition-colors shadow-2xs whitespace-nowrap"
                >
                  {language === 'id' ? 'Lengkapi CV' : 'Complete CV'}
                </Link>
              </div>
            )}

            {/* Job Cards List */}
            <div className="space-y-3.5 max-h-[85vh] overflow-y-auto pr-1">
              {filteredJobs.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                  <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {t.pelamar.dashboard.requirements}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setLocationQuery('');
                      setCategoryFilter('Semua');
                      setEmploymentTypeFilter('Semua');
                      setWorkModeFilter('Semua');
                      setExperienceFilter('Semua');
                      setEducationFilter('Semua');
                      updateUrlParams({
                        keyword: '',
                        location: '',
                        kategori_id: 'Semua',
                        tipe_pekerjaan: 'Semua',
                        lokasi_kerja: 'Semua',
                        experience_level: 'Semua',
                        pendidikan_min: 'Semua'
                      });
                    }}
                    className="px-4 py-2 rounded-full bg-[#1A4B9F] text-white font-bold text-xs cursor-pointer"
                  >
                    {language === 'id' ? 'Reset Filter' : 'Reset Filters'}
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
                      className={`p-5 rounded-2xl border transition-all cursor-pointer relative space-y-3 ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 border-2 border-[#1A4B9F] shadow-md ring-2 ring-[#1A4B9F]/20'
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
                              <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                                {job.company}
                              </span>
                              {job.matchScore > 0 && userHasCv && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                  <Sparkles size={11} className="text-emerald-600 dark:text-emerald-400" />
                                  {job.matchScore}% Match PO-Fit
                                </span>
                              )}
                              {job.isNew && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold text-[10px] border border-amber-200 dark:border-amber-800">
                                  {language === 'id' ? 'Loker Terbaru' : 'New Job'}
                                </span>
                              )}
                              {job.isPromoted && (
                                <span className="px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-semibold text-[10px]">
                                  {language === 'id' ? 'Dipromosikan' : 'Promoted'}
                                </span>
                              )}
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug hover:text-slate-900 transition-colors">
                              {job.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Kuota Posisi Badge */}
                      {job.openingsCount > 0 && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                          <Users size={12} />
                          <span>{language === 'id' ? 'Kuota:' : 'Openings:'} {job.openingsCount} {language === 'id' ? 'Posisi' : 'Positions'}</span>
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
                          <DollarSign size={14} className="text-slate-900 shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{job.salary}</span>
                        </div>
                      </div>

                      {/* Benefits List */}
                      {job.benefits && job.benefits.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {job.benefits.slice(0, 4).map((b, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-[10px] font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                              ✓ {b}
                            </span>
                          ))}
                          {job.benefits.length > 4 && (
                            <span className="text-[10px] font-bold text-slate-400">+{job.benefits.length - 4} {language === 'id' ? 'lainnya' : 'more'}</span>
                          )}
                        </div>
                      )}

                      {/* Card Bottom Time & Share/Bookmark */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <span className="text-slate-400 font-bold">
                          {language === 'id' ? 'Diterbitkan:' : 'Published:'} {job.publishDate} • {job.postedAgo}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveJob(job.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                            title={isSaved ? 'Hapus Simpan' : 'Save Job'}
                          >
                            {isSaved ? (
                              <BookmarkCheck size={16} className="text-slate-900 fill-current" />
                            ) : (
                              <Bookmark size={16} />
                            )}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShareJob(job);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
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
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-y-auto h-full custom-scrollbar">
                
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
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {selectedJob.company}
                        </span>
                        {selectedJob.isNew && (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold text-xs border border-amber-200 dark:border-amber-800">
                            {language === 'id' ? 'Loker Terbaru' : 'New Job'}
                          </span>
                        )}
                        {selectedJob.isPromoted && (
                          <span className="px-2.5 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-semibold text-xs">
                            {language === 'id' ? 'Dipromosikan' : 'Promoted'}
                          </span>
                        )}
                      </div>

                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                        {selectedJob.title}
                      </h1>

                      {selectedJob.openingsCount > 0 && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                          <Users size={12} />
                          <span>{language === 'id' ? 'Kuota Terbuka:' : 'Openings:'} {selectedJob.openingsCount} {language === 'id' ? 'Posisi' : 'Positions'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PO-Fit Match Assessment Card */}
                  {userHasCv ? (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl border border-blue-100 dark:border-slate-700 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-[#1A4B9F] text-white flex flex-col items-center justify-center font-black text-sm shadow-sm shrink-0">
                          <span>{selectedJob.matchScore}%</span>
                          <span className="text-[9px] font-normal uppercase tracking-tight">Match</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#1A4B9F]" />
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {language === 'id' ? 'Skor Kecocokan PO-Fit' : 'PO-Fit Match Score'}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                            {selectedJob.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                          {language === 'id'
                            ? 'Lengkapi profil CV Anda untuk melihat analisis kecocokan PO-Fit personal dengan lowongan ini.'
                            : 'Complete your profile/CV to see personalized PO-Fit score for this job.'}
                        </p>
                      </div>
                      <Link
                        href="/applicant/profile"
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shrink-0 transition-colors"
                      >
                        {language === 'id' ? 'Lengkapi' : 'Complete'}
                      </Link>
                    </div>
                  )}

                  {/* Info Grid Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-semibold pt-1">
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <MapPin size={16} className="text-slate-900 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{language === 'id' ? 'Lokasi Penempatan' : 'Location'}</p>
                        <p className="font-semibold">{selectedJob.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <GraduationCap size={16} className="text-slate-900 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{language === 'id' ? 'Min. Pendidikan' : 'Education'}</p>
                        <p className="font-semibold">{selectedJob.educationLevel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <Briefcase size={16} className="text-slate-900 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{language === 'id' ? 'Kebijakan & Tipe Kerja' : 'Work Policy'}</p>
                        <p className="font-semibold">{selectedJob.workPolicy}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <Award size={16} className="text-slate-900 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{language === 'id' ? 'Level Pengalaman' : 'Experience Level'}</p>
                        <p className="font-semibold">{selectedJob.experienceLevel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <DollarSign size={16} className="text-slate-900 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{language === 'id' ? 'Rentang Gaji' : 'Salary Range'}</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedJob.salary}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <Clock size={16} className="text-slate-900 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{language === 'id' ? 'Batas Akhir Lamaran' : 'Deadline'}</p>
                        <p className="font-semibold">{selectedJob.applicationDeadline || 'Tidak ditentukan'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Benefits Pills */}
                  {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{language === 'id' ? 'Fasilitas & Benefit Pekerjaan:' : 'Benefits & Perks:'}</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {selectedJob.benefits.map((benefit, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-[10px] font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                            ✓ {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 font-bold italic">
                    {language === 'id' ? 'Diterbitkan:' : 'Published:'} {selectedJob.publishDate} • {selectedJob.postedAgo}
                  </p>

                  {/* Action CTA Buttons Bar (Matching KitaLulus Primary Blue Button) */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {appliedJobs.some(id => String(id) === String(selectedJob.id)) ? (
                      <span className="px-7 py-3 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-xs sm:text-sm border border-emerald-300 flex items-center gap-2 shadow-sm cursor-not-allowed opacity-90">
                        <CheckCircle2 size={16} /> {language === 'id' ? 'Anda sudah melamar' : 'You have applied'}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyWithCv(selectedJob.id, selectedJob.company, selectedJob.title)}
                        className="px-7 py-3 rounded-2xl bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
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
                          ? 'bg-cyan-50 border-[#1A4B9F] text-slate-900 dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      title="Save Job"
                    >
                      <Bookmark size={18} className={savedJobIds.some(id => String(id) === String(selectedJob.id)) ? 'fill-current' : ''} />
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => setShareJob(selectedJob)}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                      title={language === 'id' ? 'Bagikan Lowongan' : 'Share Job'}
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Description Content */}
                <div className="p-6 sm:p-8 pt-6 space-y-6">
                  {/* Deskripsi Pekerjaan */}
                  <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      {t.pelamar.dashboard.aboutRole}
                    </h3>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {language === 'id' ? 'Gambaran Umum & Deskripsi Pekerjaan:' : 'Overview & Job Description:'}
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
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                        {language === 'id' ? 'Tanggung Jawab Utama' : 'Key Responsibilities'}
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
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
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
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                      {language === 'id' ? 'Lokasi Penempatan' : 'Placement Location'}
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <DashboardContent />
    </Suspense>
  );
}
