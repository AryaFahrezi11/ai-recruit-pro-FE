'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api, getMediaUrl, getApiUrl } from '@/lib/api';
import Footer from '@/components/Footer';
import {
  Building2,
  Search,
  MapPin,
  Briefcase,
  Users,
  Globe,
  CheckCircle2,
  ShieldCheck,
  SlidersHorizontal,
  ChevronRight,
  ArrowRight,
  User,
  Menu,
  X
} from 'lucide-react';

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
  jobs?: any[];
}

export default function GlintsStyleCompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('Semua');
  const [selectedCity, setSelectedCity] = useState('Semua');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            industri: c.industri || 'Teknologi & Informasi',
            ukuran: c.ukuran || '51 - 200 Karyawan',
            website_url: c.website_url || '',
            deskripsi: c.deskripsi || 'Perusahaan terverifikasi mitra AI-RecruitPro yang berkomitmen menghadirkan lingkungan kerja transparan dan inovatif.',
            kota: c.kota || c.alamat || 'Jakarta Selatan',
            provinsi: c.provinsi || 'DKI Jakarta',
            rating: c.rating || 4.8,
            jobs_count: c.jobs_count || (c.jobs ? c.jobs.length : 0),
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-[#1A4B9F] selection:text-white transition-colors">
      
      {/* -------------------- NAVBAR -------------------- */}
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

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/applicant/login"
              className="hidden sm:inline-flex px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#1A4B9F] dark:text-blue-400 text-sm font-bold rounded-md transition-colors items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <User size={16} />
              <span>Masuk Sebagai Pelamar</span>
            </Link>

            <Link
              href="/perusahaan/login"
              className="hidden sm:inline-flex px-4 py-2.5 bg-[#1A4B9F] hover:bg-[#1C41C5] text-white text-sm font-bold rounded-md transition-colors items-center gap-1.5"
            >
              <Building2 size={16} />
              <span>Masuk Sebagai Perusahaan</span>
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
                className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#1A4B9F] dark:text-blue-400 text-sm font-bold border border-slate-200 dark:border-slate-700"
              >
                <User size={16} />
                <span>Masuk Sebagai Pelamar</span>
              </Link>
              <Link
                href="/perusahaan/login"
                className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1A4B9F] hover:bg-[#133878] text-white text-sm font-bold shadow-sm"
              >
                <Building2 size={16} />
                <span>Masuk Sebagai Perusahaan</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* -------------------- GLINTS STYLE HERO BANNER -------------------- */}
      <section className="bg-gradient-to-r from-[#0A2152] via-[#1A4B9F] to-[#2B60B3] text-white py-16 px-6 sm:px-10 lg:px-16 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto space-y-6 relative z-10">
          
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-blue-100 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Building2 size={14} /> Direktori Perusahaan Indonesia 2026
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Perusahaan Indonesia yang Membuka Lowongan Kerja
            </h1>
            <p className="text-base sm:text-lg text-blue-100 font-normal leading-relaxed">
              Jelajahi profil lengkap perusahaan terpercaya, budaya kerja, lokasi kantor pusat, dan temukan lowongan karir terbaru yang sedang aktif dibuka.
            </p>
          </div>

          {/* Search Toolbar */}
          <div className="bg-white rounded-2xl p-3 shadow-2xl border border-slate-200 text-slate-900 mt-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Search Bar */}
              <div className="md:col-span-6 relative flex items-center border-b md:border-b-0 md:border-r border-slate-200 pb-2 md:pb-0 pr-3">
                <Search size={20} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama perusahaan atau kata kunci..."
                  className="w-full pl-10 pr-3 py-2.5 text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Filter Industri */}
              <div className="md:col-span-3 flex items-center border-b md:border-b-0 md:border-r border-slate-200 pb-2 md:pb-0 px-3">
                <Building2 size={18} className="text-slate-400 mr-2 shrink-0" />
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full py-2 bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {industriesList.map(ind => (
                    <option key={ind} value={ind}>{ind === 'Semua' ? 'Semua Industri' : ind}</option>
                  ))}
                </select>
              </div>

              {/* Filter Kota */}
              <div className="md:col-span-3 flex items-center px-3">
                <MapPin size={18} className="text-slate-400 mr-2 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full py-2 bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {citiesList.map(city => (
                    <option key={city} value={city}>{city === 'Semua' ? 'Semua Lokasi' : city}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* -------------------- MAIN DIRECTORY LIST -------------------- */}
      <main className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-12 flex-1 w-full space-y-8">
        
        {/* Results Count & Reset */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
            Menampilkan <strong className="text-slate-900 dark:text-white font-bold">{filteredCompanies.length}</strong> perusahaan terverifikasi
          </p>

          {(searchQuery || selectedIndustry !== 'Semua' || selectedCity !== 'Semua') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedIndustry('Semua'); setSelectedCity('Semua'); }}
              className="text-xs font-bold text-[#1A4B9F] hover:underline cursor-pointer"
            >
              Reset Semua Filter
            </button>
          )}
        </div>

        {/* Company Grid (Glints Style Cards) */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1A4B9F] mx-auto mb-4"></div>
            <p className="text-slate-500 font-semibold animate-pulse">Memuat direktori perusahaan...</p>
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((comp) => (
              <div
                key={comp.id}
                onClick={() => router.push(`/applicant/companies/${comp.id}`)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-[#1A4B9F] dark:hover:border-blue-500 transition-all duration-300 flex flex-col justify-between cursor-pointer group space-y-5"
              >
                <div className="space-y-4">
                  
                  {/* Header Logo + Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 shrink-0 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden">
                      {comp.logo_url ? (
                        <img
                          src={comp.logo_url}
                          alt={comp.nama_perusahaan}
                          className="max-w-full max-h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-[#1A4B9F] dark:text-blue-400">
                          <Building2 size={24} />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-[#1A4B9F] dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {comp.nama_perusahaan}
                        </h3>
                        <span title="Perusahaan Terverifikasi">
                          <ShieldCheck size={18} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
                        </span>
                      </div>
                      <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {comp.industri}
                      </span>
                    </div>
                  </div>

                  {/* Location & Size */}
                  <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#1A4B9F] shrink-0" />
                      <span className="font-medium truncate">{comp.kota || 'Indonesia'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#1A4B9F] shrink-0" />
                      <span className="font-medium">{comp.ukuran || '50+ Karyawan'}</span>
                    </div>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                    {comp.deskripsi}
                  </p>

                </div>

                {/* Footer Openings count & Action Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A4B9F] dark:text-blue-400 bg-[#E8F1FC] dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                    <Briefcase size={14} />
                    <span>{comp.jobs_count} Lowongan Aktif</span>
                  </div>

                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#1A4B9F] dark:group-hover:text-blue-400 flex items-center gap-1 transition-colors">
                    Lihat Profil <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Building2 size={48} className="text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Perusahaan tidak ditemukan</h3>
            <p className="text-sm text-slate-500">Coba ubah kata kunci pencarian atau reset filter industri/lokasi Anda.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedIndustry('Semua'); setSelectedCity('Semua'); }}
              className="px-6 py-2.5 rounded-full bg-[#1A4B9F] text-white text-xs font-bold cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}

      </main>

      {/* -------------------- FOOTER -------------------- */}
      <Footer />

    </div>
  );
}
