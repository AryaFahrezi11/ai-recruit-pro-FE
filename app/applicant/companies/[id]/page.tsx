'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, getMediaUrl } from '@/lib/api';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Briefcase,
  ChevronLeft,
  Calendar,
  ExternalLink,
  Info
} from 'lucide-react';

interface CompanyProfile {
  id: number;
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
  jobs: any[];
}

export default function CompanyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [similarCompanies, setSimilarCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const [resComp, resAll] = await Promise.all([
          api.get(`/perusahaan/${id}`),
          api.get('/perusahaan/verified')
        ]);
        const data = resComp.data || resComp;
        const allComps = resAll.data || resAll;

        // Handle logo absolute URL
        if (data.logo_url && !data.logo_url.startsWith('http')) {
          data.logo_url = getMediaUrl(data.logo_url);
        }

        setCompany(data);

        // Find similar companies
        if (allComps && Array.isArray(allComps)) {
          let similar = allComps.filter((c: any) => c.id !== id && c.industri === data.industri);
          if (similar.length === 0) {
            // Fallback if no exact industry match
            similar = allComps.filter((c: any) => c.id !== id);
          }
          similar = similar.slice(0, 4);

          // Handle logo absolute URLs for similar companies
          similar.forEach((c: any) => {
            if (c.logo_url && !c.logo_url.startsWith('http')) {
              c.logo_url = getMediaUrl(c.logo_url);
            }
          });
          setSimilarCompanies(similar);
        }
      } catch (err) {
        console.error('Failed to fetch company:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchCompany();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A4B9F]"></div>
        <p className="mt-4 text-slate-500 font-semibold animate-pulse">Memuat profil perusahaan...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-center px-4">
        <Building2 size={64} className="text-slate-300 dark:text-slate-700 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Perusahaan Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-6">Profil perusahaan ini mungkin belum diverifikasi atau tidak tersedia.</p>
        <button
          onClick={() => router.push('/applicant/dashboard?view=companies')}
          className="px-6 py-3 rounded-full bg-[#1A4B9F] text-white font-bold hover:bg-[#133A7A] transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20">
      {/* Header Banner */}
      <div className="h-48 sm:h-64 md:h-80 w-full bg-gradient-to-r from-[#0A2540] to-[#1A4B9F] dark:from-slate-900 dark:to-[#0A2540] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <button
          onClick={() => router.push('/applicant/dashboard?view=companies')}
          className="absolute top-6 left-6 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10">

        {/* Main Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-10 shadow-xl border border-slate-100 dark:border-slate-800 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Logo */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-2xl p-2 shadow-md border border-slate-100 dark:border-slate-700 shrink-0 mx-auto sm:mx-0">
              <img
                src={company.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'}
                alt={company.nama_perusahaan}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            {/* Core Info */}
            <div className="flex-1 text-center sm:text-left pt-2 sm:pt-4">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {company.nama_perusahaan}
                </h1>
                <div 
                  className="flex items-center justify-center text-[#1A4B9F] dark:text-blue-400" 
                  title="Perusahaan Terverifikasi"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-8 sm:h-8">
                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-base sm:text-lg text-slate-500 font-semibold mb-6 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Building2 size={18} /> {company.industri || 'Umum & Teknologi'}
                <span className="text-slate-300">•</span>
                <MapPin size={18} /> {company.kota || company.alamat || 'Indonesia'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                {company.website_url && (
                  <a
                    href={company.website_url.startsWith('http') ? company.website_url : `https://${company.website_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <Globe size={16} className="text-[#1A4B9F]" /> Website Perusahaan
                  </a>
                )}
              </div>
            </div>
          </div>

          <hr className="my-8 border-slate-100 dark:border-slate-800" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 rounded-xl bg-[#EFF6FF] dark:bg-slate-800/40 border border-[#DBEAFE] dark:border-slate-700/50 text-center">
              <Users size={24} className="mx-auto text-[#1A4B9F] mb-2" />
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Ukuran Perusahaan</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">{company.ukuran || 'Tidak disebutkan'}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#EFF6FF] dark:bg-slate-800/40 border border-[#DBEAFE] dark:border-slate-700/50 text-center">
              <Calendar size={24} className="mx-auto text-[#1A4B9F] mb-2" />
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Tahun Berdiri</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">{company.tahun_berdiri || '-'}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#EFF6FF] dark:bg-slate-800/40 border border-[#DBEAFE] dark:border-slate-700/50 text-center">
              <MapPin size={24} className="mx-auto text-[#1A4B9F] mb-2" />
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Kantor Pusat</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{company.kota || '-'}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#EFF6FF] dark:bg-slate-800/40 border border-[#DBEAFE] dark:border-slate-700/50 text-center">
              <Briefcase size={24} className="mx-auto text-[#1A4B9F] mb-2" />
              <p className="text-[10px] sm:text-xs text-[#1A4B9F] dark:text-blue-400 uppercase tracking-wider font-bold mb-1">Lowongan Aktif</p>
              <p className="font-bold text-[#1A4B9F] dark:text-blue-300 text-lg">{company.jobs_count}</p>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="space-y-10">

          {/* Section 1: Description & Address */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <Info className="text-[#1A4B9F]" size={24} />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Tentang Perusahaan</h3>
              </div>
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                {company.deskripsi || 'Belum ada deskripsi yang ditambahkan oleh perusahaan.'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="text-[#1A4B9F]" size={24} />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Alamat Lengkap</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {company.alamat ? `${company.alamat}, ${company.kota}, ${company.provinsi}` : 'Alamat lengkap belum ditambahkan.'}
              </p>
            </div>
          </div>

          {/* Section 2: Active Jobs (Horizontal Scroll) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Briefcase size={24} className="text-[#1A4B9F]" /> Loker Aktif
              </h3>
              <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1A4B9F] font-bold text-xs">
                {company.jobs_count} Lowongan Buka
              </span>
            </div>

            {(!company.jobs || company.jobs.length === 0) ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 mx-auto flex items-center justify-center mb-4">
                  <Briefcase size={28} className="text-slate-300" />
                </div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Belum ada lowongan</h4>
                <p className="text-xs text-slate-500">Perusahaan ini sedang tidak membuka lowongan pekerjaan baru.</p>
              </div>
            ) : (
              <div className="relative overflow-hidden w-full pb-6">
                <style dangerouslySetInnerHTML={{
                  __html: `
                  @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-50% - 12px)); }
                  }
                  .animate-marquee {
                    animation: marquee 30s linear infinite;
                  }
                  .animate-marquee:hover {
                    animation-play-state: paused;
                  }
                `}} />

                <div className="flex w-max gap-6 animate-marquee">
                  {[...company.jobs, ...company.jobs, ...company.jobs, ...company.jobs].map((job, idx) => (
                    <div
                      key={`${job.id}-${idx}`}
                      className="min-w-[280px] sm:min-w-[340px] max-w-[360px] flex-shrink-0 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-[#1A4B9F]/50 transition-all cursor-pointer group flex flex-col justify-between h-[240px]"
                      onClick={() => router.push(`/applicant/dashboard?view=recommended&jobId=${job.id}`)}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-slate-800 dark:text-white text-lg group-hover:text-[#1A4B9F] transition-colors leading-snug line-clamp-2 pr-4">
                            {job.judul_posisi}
                          </h4>
                          <ExternalLink size={16} className="text-slate-300 group-hover:text-[#1A4B9F] opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-1" />
                        </div>
                        <div className="space-y-2 text-xs font-semibold text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-[#1A4B9F]" /> {job.kota} ({job.lokasi_kerja === 'remote' ? 'Remote' : 'On-site'})
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Briefcase size={14} className="text-[#1A4B9F]" /> {job.experience_level || 'Semua Level'}
                          </div>
                          {(job.tampilkan_gaji && job.gaji_min && job.gaji_max) && (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mt-2">
                              <span className="font-bold text-sm bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">Rp {(job.gaji_min / 1000000).toFixed(0)} Jt - Rp {(job.gaji_max / 1000000).toFixed(0)} Jt</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                          {job.tipe_pekerjaan ? job.tipe_pekerjaan.split('_').join(' ').toUpperCase() : 'FULL TIME'}
                        </span>
                        <span className="text-xs font-bold text-[#1A4B9F] bg-[#EFF6FF] px-3 py-1.5 rounded-lg group-hover:bg-[#1A4B9F] group-hover:text-white transition-all">
                          Lihat Detail &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Similar Companies */}
          {similarCompanies.length > 0 && (
            <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Building2 size={24} className="text-[#1A4B9F]" /> Perusahaan Serupa
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {similarCompanies.map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => router.push(`/applicant/companies/${comp.id}`)}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-[#1A4B9F]/40 transition-all cursor-pointer flex flex-col items-center text-center group"
                  >
                    <img
                      src={comp.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80'}
                      alt={comp.nama_perusahaan}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 dark:border-slate-700 mb-3"
                    />
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-[#1A4B9F] transition-colors mb-1 line-clamp-1">
                      {comp.nama_perusahaan}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold mb-3">{comp.industri}</p>
                    <div className="w-full mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-[#1A4B9F] group-hover:underline">
                        {comp.jobs_count || 0} Lowongan Buka
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
