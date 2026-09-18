'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { api, getMediaUrl, getApiUrl } from '@/lib/api';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
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
  RotateCcw
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
  alamat?: string;
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
  const [selectedCity, setSelectedCity] = useState(initialCity === 'Semua' ? '' : initialCity);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [suggestedLocations, setSuggestedLocations] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationContainerRef = useRef<HTMLDivElement>(null);

  // Close location suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationContainerRef.current && !locationContainerRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Pagination State (Max 15 boxes per page)
  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 15;

  // Keep state in sync with URL searchParams (e.g. Back/Forward browser navigation)
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedIndustry(searchParams.get('industry') || 'Semua');
    const cParam = searchParams.get('city') || '';
    setSelectedCity(cParam === 'Semua' ? '' : cParam);
    const p = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(isNaN(p) || p < 1 ? 1 : p);
  }, [searchParams]);

  // Helper to update GET URL query string
  const updateUrl = (q: string, ind: string, city: string, page: number) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (ind && ind !== 'Semua') params.set('industry', ind);
    if (city && city !== 'Semua' && city.trim()) params.set('city', city.trim());
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
            industri: c.industri || 'Industri belum diatur',
            ukuran: c.ukuran || 'Ukuran belum diatur',
            website_url: c.website_url || '',
            deskripsi: c.deskripsi || '',
            alamat: c.alamat || '',
            kota: c.alamat || c.kota || 'Lokasi belum diatur',
            provinsi: c.provinsi || '',
            rating: c.rating || 5.0,
            jobs_count: c.jobs_count || (c.jobs ? c.jobs.length : 0),
            last_active: c.last_active || 'Aktif',
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

    const fetchLocations = async () => {
      try {
        const res = await api.get('/perusahaan/locations');
        if (res?.locations && Array.isArray(res.locations)) {
          setSuggestedLocations(res.locations);
        }
      } catch (err) {
        console.error('Failed to fetch company locations:', err);
      }
    };

    fetchCompanies();
    fetchLocations();
  }, []);

  const allCompanies = useMemo(() => {
    return companies || [];
  }, [companies]);

  // Dynamic filter options
  const industriesList = useMemo(() => {
    const list = Array.from(new Set(allCompanies.map(c => c.industri))).filter(Boolean);
    return ['Semua', ...list];
  }, [allCompanies]);

  // Filtered List (Based on URL search params, not live local state)
  const filteredCompanies = useMemo(() => {
    const q = searchParams.get('q') || '';
    const ind = searchParams.get('industry') || 'Semua';
    const city = searchParams.get('city') || '';

    return allCompanies.filter(c => {
      const matchName = q === '' || 
        c.nama_perusahaan.toLowerCase().includes(q.toLowerCase()) ||
        c.industri.toLowerCase().includes(q.toLowerCase()) ||
        (c.alamat && c.alamat.toLowerCase().includes(q.toLowerCase())) ||
        (c.kota && c.kota.toLowerCase().includes(q.toLowerCase()));
      
      const matchInd = ind === 'Semua' || c.industri === ind;
      const matchCity = !city || city === 'Semua' || 
        (c.alamat && c.alamat.toLowerCase().includes(city.toLowerCase())) ||
        (c.kota && c.kota.toLowerCase().includes(city.toLowerCase()));

      return matchName && matchInd && matchCity;
    });
  }, [allCompanies, searchParams]);

  // Paginated List (max 15 items per page)
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage) || 1;
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(start, start + itemsPerPage);
  }, [filteredCompanies, currentPage]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowLocationSuggestions(false);
    setCurrentPage(1);
    updateUrl(searchQuery, selectedIndustry, selectedCity, 1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  const handleIndustryChange = (val: string) => {
    setSelectedIndustry(val);
  };

  const handleCityChange = (val: string) => {
    setSelectedCity(val);
  };

  const handleReset = () => {
    setShowLocationSuggestions(false);
    setSearchQuery('');
    setSelectedIndustry('Semua');
    setSelectedCity('');
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
      {!isApplicantRoute && <Navbar activePage="companies" />}

      {/* -------------------- CLEAN NEUTRAL SEARCH BAR & FILTER CHIPS -------------------- */}
      <section className="pt-3 sm:pt-8 pb-1.5 sm:pb-3 px-3 sm:px-6">
        <div className="max-w-[1440px] mx-auto space-y-2 sm:space-y-4">
          
          {/* Header Context */}
          <div>
            <h1 className="text-base sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Eksplorasi Perusahaan
            </h1>
            <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Temukan perusahaan terpercaya, dan lowongan karir terbaik di Indonesia.
            </p>
          </div>

          {/* Unified Integrated Search Command Box */}
          <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 shadow-xs relative z-30">
            <div className="flex flex-col lg:flex-row items-stretch gap-1.5 sm:gap-2">
              
              {/* Field 1: Keyword Input */}
              <div className="flex-1 bg-slate-50 dark:bg-slate-800/80 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-2 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-slate-400 transition-all">
                <Search size={15} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Cari nama perusahaan..."
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); handleSearchSubmit(); }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1 cursor-pointer shrink-0"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Row 2 on Mobile: Location & Industry side-by-side in 2 columns */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full lg:contents">
                {/* Field 2: Location Search Input */}
                <div ref={locationContainerRef} className="bg-slate-50 dark:bg-slate-800/80 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-slate-400 transition-all relative z-40">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={selectedCity === 'Semua' ? '' : selectedCity}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setShowLocationSuggestions(true);
                    }}
                    placeholder="Semua Kota..."
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                  {selectedCity && selectedCity !== 'Semua' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCity('');
                        setShowLocationSuggestions(false);
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-0.5 cursor-pointer shrink-0"
                    >
                      <X size={12} />
                    </button>
                  )}

                  {/* Location Suggestions Dropdown */}
                  {showLocationSuggestions && suggestedLocations.length > 0 && (
                    <div className="absolute top-[calc(100%+6px)] left-0 right-0 sm:right-auto sm:w-64 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-50 text-slate-800 dark:text-slate-200 max-h-52 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50">
                        <span>Lokasi Sering Dicari</span>
                        <X className="w-3.5 h-3.5 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors" onClick={() => setShowLocationSuggestions(false)} />
                      </div>
                      {suggestedLocations
                        .filter(loc => !selectedCity || selectedCity === 'Semua' || loc.toLowerCase().includes(selectedCity.toLowerCase()))
                        .map((loc, idx) => (
                          <div
                            key={idx}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSelectedCity(loc);
                              setShowLocationSuggestions(false);
                            }}
                            className="px-3.5 py-1.5 hover:bg-[#EFF6FF] dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer flex items-center gap-2 border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                            <span className="truncate">{loc}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Field 3: Industry Selector */}
                <div className="w-full lg:w-56 bg-slate-50 dark:bg-slate-800/80 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 relative hover:border-slate-400 transition-colors">
                  <Building2 size={14} className="text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
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
                  <ChevronDown size={12} className="absolute right-2 text-slate-400 pointer-events-none stroke-[2]" />
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-1.5 sm:gap-2 w-full lg:w-auto">
                <button
                  type="submit"
                  className="flex-1 lg:flex-none h-9 sm:h-10 px-4 sm:px-5 rounded-lg sm:rounded-xl bg-[#1A4B9F] hover:bg-[#133878] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  <Search size={14} />
                  <span>Cari</span>
                </button>

                {/* Reset / Clear Button (if active) */}
                {(searchQuery || (selectedIndustry && selectedIndustry !== 'Semua') || Boolean(selectedCity && selectedCity !== 'Semua')) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    title="Reset Filter"
                    className="h-9 sm:h-10 px-3 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 transition-colors shrink-0 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

            </div>
          </form>

        </div>
      </section>

      {/* -------------------- MAIN DIRECTORY GRID (3 COLUMNS MAX 15 BOXES) -------------------- */}
      <main id="company-grid-section" className="w-full max-w-[1440px] mx-auto px-3 sm:px-10 lg:px-14 py-2.5 sm:py-6 flex-1 space-y-3 sm:space-y-6">
        
        {/* Results Counter Sub-header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2 sm:pb-3">
          <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Menampilkan <strong className="text-slate-900 dark:text-white font-bold">{startIndex} - {endIndex}</strong> dari <strong className="text-slate-900 dark:text-white font-bold">{filteredCompanies.length}</strong> perusahaan terverifikasi
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 dark:border-slate-200 mx-auto mb-3"></div>
            <p className="text-slate-500 text-xs font-semibold animate-pulse">Memuat daftar perusahaan...</p>
          </div>
        ) : paginatedCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
            {paginatedCompanies.map((comp) => {
              const compSlug = slugify(comp.nama_perusahaan);
              const compPath = isApplicantRoute
                ? `/applicant/companies/${compSlug}/${comp.id}`
                : `/companies/${compSlug}/${comp.id}`;

              return (
                <div
                  key={comp.id}
                  onClick={() => router.push(compPath)}
                  className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 sm:space-y-3.5 group"
                >
                <div className="space-y-1.5 sm:space-y-3">
                  
                  {/* Logo + Verified Title + Location */}
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shrink-0 flex items-center justify-center bg-white dark:bg-slate-900 overflow-hidden shadow-2xs group-hover:scale-105 transition-transform">
                      {comp.logo_url ? (
                        <img
                          src={comp.logo_url}
                          alt={comp.nama_perusahaan}
                          className="max-w-full max-h-full object-contain rounded-md"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z'/%3E%3Cpath d='M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2'/%3E%3Cpath d='M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2'/%3E%3Cpath d='M10 6h4'/%3E%3Cpath d='M10 10h4'/%3E%3Cpath d='M10 14h4'/%3E%3Cpath d='M10 18h4'/%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <Building2 size={22} className="text-slate-400" />
                      )}
                    </div>

                    <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-[#1A4B9F] dark:group-hover:text-blue-400 transition-colors truncate">
                          {comp.nama_perusahaan}
                        </h3>
                        <span title="Perusahaan Terverifikasi" className="shrink-0">
                          <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span>{comp.alamat || comp.kota || 'Indonesia'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Industry & Vacancies in compact inline layout */}
                  <div className="flex items-center justify-between gap-2 pt-0.5 sm:pt-1">
                    <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 min-w-0 truncate">
                      <Building2 size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate font-medium">{comp.industri || 'Teknologi & Informasi'}</span>
                    </div>
                    <span className="shrink-0 text-[#1A4B9F] dark:text-blue-300 font-bold bg-blue-50/90 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] flex items-center gap-1">
                      <Briefcase size={10} className="text-[#1A4B9F] dark:text-blue-300 shrink-0" />
                      {comp.jobs_count} Lowongan Aktif
                    </span>
                  </div>

                </div>

                {/* Footer Status */}
                <div className="pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock size={11} className="shrink-0 text-slate-400" />
                    <span>Terakhir aktif {comp.last_active || 'Aktif'}</span>
                  </div>
                  <span className="text-[#1A4B9F] dark:text-blue-400 font-bold text-[10px] flex items-center gap-0.5 group-hover:underline">
                    Lihat Profil <ChevronRight size={11} />
                  </span>
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

