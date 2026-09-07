'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { api, getMediaUrl, getApiUrl } from '@/lib/api';
import Footer from '@/components/Footer';
import {
  Building2,
  Search,
  MapPin,
  Briefcase,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  User,
  Menu,
  X,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

const slugify = (text: string) => {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

interface Company {
  id: number | string;
  nama_perusahaan: string;
  logo_url: string;
  industri: string;
  ukuran: string;
  website_url?: string;
  deskripsi?: string;
  kota?: string;
  provinsi?: string;
  rating?: number;
  jobs_count: number;
  last_active?: string;
  jobs?: any[];
}

function CompaniesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isApplicantRoute = pathname?.startsWith('/applicant');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Read initial GET query parameter values from URL
  const initialQuery = searchParams.get('q') || '';
  const initialIndustry = searchParams.get('industry') || 'Semua';
  const initialCity = searchParams.get('city') || 'Semua';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedIndustry, setSelectedIndustry] = useState(initialIndustry);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Pagination State (Max 15 boxes per page)
  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 15;

  // Keep state in sync with URL searchParams (e.g. Back/Forward browser navigation)
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedIndustry(searchParams.get('industry') || 'Semua');
    setSelectedCity(searchParams.get('city') || 'Semua');
    const p = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(isNaN(p) || p < 1 ? 1 : p);
  }, [searchParams]);

  // Helper to update GET URL query string
  const updateUrl = (q: string, ind: string, city: string, page: number) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (ind && ind !== 'Semua') params.set('industry', ind);
    if (city && city !== 'Semua') params.set('city', city);
    if (page > 1) params.set('page', page.toString());

    const queryString = params.toString();
    const newPath = `${pathname}${queryString ? `?${queryString}` : ''}`;
    router.replace(newPath, { scroll: false });
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await fetch(getApiUrl('/perusahaan/verified'));
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((c: any) => ({
            id: c.id,
            nama_perusahaan: c.nama_perusahaan,
            logo_url: c.logo_url ? (c.logo_url.startsWith('http') ? c.logo_url : getMediaUrl(c.logo_url)) : '',
            industri: c.industri || 'Computer Software',
            ukuran: c.ukuran || '51 - 200 Karyawan',
            website_url: c.website_url || '',
            deskripsi: c.deskripsi || '',
            kota: c.kota || c.alamat || 'Jakarta Barat',
            provinsi: c.provinsi || 'DKI Jakarta',
            rating: c.rating || 4.8,
            jobs_count: c.jobs_count || (c.jobs ? c.jobs.length : 1),
            last_active: c.last_active || 'sejam yang lalu',
            jobs: c.jobs || []
          }));
          setCompanies(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const allCompanies = useMemo(() => {
    return companies || [];
  }, [companies]);

  // Dynamic filter options
  const industriesList = useMemo(() => {
    const list = Array.from(new Set(allCompanies.map(c => c.industri))).filter(Boolean);
    return ['Semua', ...list];
  }, [allCompanies]);

  const citiesList = useMemo(() => {
    const list = Array.from(new Set(allCompanies.map(c => c.kota))).filter(Boolean);
    return ['Semua', ...list];
  }, [allCompanies]);

  // Filtered List
  const filteredCompanies = useMemo(() => {
    return allCompanies.filter(c => {
      const matchName = searchQuery === '' || 
        c.nama_perusahaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industri.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.kota && c.kota.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchInd = selectedIndustry === 'Semua' || c.industri === selectedIndustry;
      const matchCity = selectedCity === 'Semua' || c.kota === selectedCity;

      return matchName && matchInd && matchCity;
    });
  }, [allCompanies, searchQuery, selectedIndustry, selectedCity]);

  // Paginated List (max 15 items per page)
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage) || 1;
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(start, start + itemsPerPage);
  }, [filteredCompanies, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    updateUrl(val, selectedIndustry, selectedCity, 1);
  };

  const handleIndustryChange = (val: string) => {
    setSelectedIndustry(val);
    setCurrentPage(1);
    updateUrl(searchQuery, val, selectedCity, 1);
  };

  const handleCityChange = (val: string) => {
    setSelectedCity(val);
    setCurrentPage(1);
    updateUrl(searchQuery, selectedIndustry, val, 1);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedIndustry('Semua');
    setSelectedCity('Semua');
    setCurrentPage(1);
    router.replace(pathname, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateUrl(searchQuery, selectedIndustry, selectedCity, page);
      const gridElem = document.getElementById('company-grid-section');
      if (gridElem) {
        gridElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const startIndex = filteredCompanies.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredCompanies.length);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#1A4B9F] selection:text-white transition-colors">
      
      {/* -------------------- NAVBAR (ONLY IF NOT IN APPLICANT ROUTE) -------------------- */}
      {!isApplicantRoute && (
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
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
              <Link href="/companies" className="text-slate-900 dark:text-white font-extrabold relative after:content-[''] after:absolute after:bottom-[-29px] after:left-0 after:right-0 after:h-0.5 after:bg-slate-900 dark:after:bg-white">
                Perusahaan
              </Link>
              <Link href="/#success-stories" className="hover:text-[#1A4B9F] transition-colors">
                Kisah Sukses
              </Link>
            </nav>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/applicant/login"
                className="hidden sm:inline-flex px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors items-center gap-1.5 border border-slate-200 dark:border-slate-700"
              >
                <User size={15} />
                <span>Masuk</span>
              </Link>

              <Link
                href="/perusahaan/login"
                className="hidden sm:inline-flex px-4 py-2 bg-[#1A4B9F] hover:bg-[#133878] text-white text-sm font-bold rounded-lg transition-colors items-center gap-1.5 shadow-2xs"
              >
                <Building2 size={15} />
                <span>Untuk Perusahaan</span>
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

      {/* -------------------- CLEAN NEUTRAL SEARCH BAR & FILTER CHIPS -------------------- */}
      <section className="pt-8 pb-3 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-4">
          
          {/* Header Context (Clean Minimalist Title - No AI Badges) */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Eksplorasi Perusahaan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Temukan perusahaan terpercaya, budaya kerja, dan lowongan karir terbaik di Indonesia.
            </p>
          </div>

          {/* Unified Integrated Search Command Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 shadow-xs">
            <div className="flex flex-col lg:flex-row items-stretch gap-2">
              
              {/* Field 1: Keyword Input */}
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 flex items-center gap-2.5 focus-within:bg-white focus-within:border-slate-400 transition-all">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Cari nama perusahaan, industri, atau kata kunci..."
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Field 2: Industry Selector */}
              <div className="w-full lg:w-56 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 flex items-center gap-2 relative hover:border-slate-400 transition-colors">
                <Building2 size={16} className="text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 leading-none mb-0.5">Industri</span>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => handleIndustryChange(e.target.value)}
                    className="w-full appearance-none bg-transparent pr-4 font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer text-xs truncate"
                  >
                    {industriesList.map(ind => (
                      <option key={ind} value={ind} className="bg-white dark:bg-slate-900 font-medium">
                        {ind === 'Semua' ? 'Semua Industri' : ind}
                      </option>
                    ))}
                  </select>
                </div>
                <ChevronDown size={14} className="absolute right-3 text-slate-400 pointer-events-none stroke-[2]" />
              </div>

              {/* Field 3: City Selector */}
              <div className="w-full lg:w-48 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 flex items-center gap-2 relative hover:border-slate-400 transition-colors">
                <MapPin size={16} className="text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 leading-none mb-0.5">Lokasi</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full appearance-none bg-transparent pr-4 font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer text-xs truncate"
                  >
                    {citiesList.map(city => (
                      <option key={city} value={city} className="bg-white dark:bg-slate-900 font-medium">
                        {city === 'Semua' ? 'Semua Lokasi' : city}
                      </option>
                    ))}
                  </select>
                </div>
                <ChevronDown size={14} className="absolute right-3 text-slate-400 pointer-events-none stroke-[2]" />
              </div>

              {/* Reset / Clear Button (if active) */}
              {(searchQuery || selectedIndustry !== 'Semua' || selectedCity !== 'Semua') && (
                <button
                  onClick={handleReset}
                  title="Reset Filter"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors shrink-0 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* -------------------- MAIN DIRECTORY GRID (3 COLUMNS MAX 15 BOXES) -------------------- */}
      <main id="company-grid-section" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        
        {/* Results Counter Sub-header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Menampilkan <strong className="text-slate-900 dark:text-white font-bold">{startIndex} - {endIndex}</strong> dari <strong className="text-slate-900 dark:text-white font-bold">{filteredCompanies.length}</strong> perusahaan terverifikasi
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 dark:border-slate-200 mx-auto mb-3"></div>
            <p className="text-slate-500 text-xs font-semibold animate-pulse">Memuat daftar perusahaan...</p>
          </div>
        ) : paginatedCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {paginatedCompanies.map((comp) => {
              const compSlug = slugify(comp.nama_perusahaan);
              const compPath = isApplicantRoute
                ? `/applicant/companies/${compSlug}/${comp.id}`
                : `/companies/${compSlug}/${comp.id}`;

              return (
                <div
                  key={comp.id}
                  onClick={() => router.push(compPath)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                <div className="space-y-3">
                  
                  {/* Logo + Verified Title + Location */}
                  <div className="flex items-start gap-3">
                    <div className="w-13 h-13 rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 shrink-0 flex items-center justify-center bg-white dark:bg-slate-900 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                      {comp.logo_url ? (
                        <img
                          src={comp.logo_url}
                          alt={comp.nama_perusahaan}
                          className="max-w-full max-h-full object-contain rounded-md"
                        />
                      ) : (
                        <Building2 size={24} className="text-slate-400" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white group-hover:underline transition-all truncate">
                          {comp.nama_perusahaan}
                        </h3>
                        <span title="Perusahaan Terverifikasi" className="shrink-0">
                          <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span>{comp.kota ? `${comp.kota}, ${comp.provinsi || 'DKI Jakarta'}` : 'Indonesia'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Industry & Vacancies */}
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate font-medium">{comp.industri || 'Teknologi & Informasi'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
                        <Briefcase size={12} className="text-slate-500 shrink-0" />
                        {comp.jobs_count} Lowongan Aktif
                      </span>
                    </div>
                  </div>

                </div>

                {/* Footer Status */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="shrink-0 text-slate-400" />
                    <span>Terakhir aktif {comp.last_active || 'sejam yang lalu'}</span>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:translate-x-1 transition-all shrink-0" />
                </div>

              </div>
            );
          })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3 max-w-xl mx-auto">
            <Building2 size={40} className="text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Perusahaan tidak ditemukan</h3>
            <p className="text-xs text-slate-500">Tidak ada perusahaan yang sesuai dengan kata kunci atau filter lokasi.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedIndustry('Semua'); setSelectedCity('Semua'); }}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* -------------------- PAGINATION CONTROLS -------------------- */}
        {!loading && filteredCompanies.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    currentPage === page
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Halaman Selanjutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </main>

      {/* -------------------- FOOTER (ONLY IF NOT IN APPLICANT ROUTE) -------------------- */}
      {!isApplicantRoute && <Footer />}

    </div>
  );
}

export default function GlintsStyleCompaniesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 dark:border-slate-200"></div>
      </div>
    }>
      <CompaniesPageContent />
    </Suspense>
  );
}

