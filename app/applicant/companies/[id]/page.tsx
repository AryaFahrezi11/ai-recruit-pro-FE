'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, getBaseUrl } from '@/lib/api';
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

export default function CompanyProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get(`/perusahaan/${id}`);
        const data = res.data || res;
        
        // Handle logo absolute URL
        if (data.logo_url && !data.logo_url.startsWith('http')) {
            const baseUrl = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
            data.logo_url = `http://${baseUrl}:8000${data.logo_url}`;
        }
        
        setCompany(data);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2596be]"></div>
        <p className="mt-4 text-slate-500 font-semibold animate-pulse">Memuat profil perusahaan...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-center px-4">
        <Building2 size={64} className="text-slate-300 dark:text-slate-700 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Perusahaan Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-6">Profil perusahaan ini mungkin belum diverifikasi atau tidak tersedia.</p>
        <button 
          onClick={() => router.push('/applicant/dashboard?view=companies')}
          className="px-6 py-3 rounded-full bg-[#2596be] text-white font-bold hover:bg-[#1d7fa1] transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20">
      {/* Header Banner */}
      <div className="h-48 sm:h-64 md:h-80 w-full bg-gradient-to-r from-[#1E293B] to-[#334155] dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 dark:border-slate-800 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Logo */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-3xl p-2 shadow-md border border-slate-100 dark:border-slate-700 shrink-0 mx-auto sm:mx-0">
              <img 
                src={company.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'} 
                alt={company.nama_perusahaan} 
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
            
            {/* Core Info */}
            <div className="flex-1 text-center sm:text-left pt-2 sm:pt-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-extrabold text-[10px] sm:text-xs mb-3 border border-emerald-200 dark:border-emerald-900">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Perusahaan Terverifikasi
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                {company.nama_perusahaan}
              </h1>
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
                    <Globe size={16} className="text-[#2596be]" /> Website Perusahaan
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <hr className="my-8 border-slate-100 dark:border-slate-800" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-4 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800/40 border border-[#C2E5EF] dark:border-slate-700/50 text-center">
              <Users size={24} className="mx-auto text-[#2596be] mb-2" />
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Ukuran Perusahaan</p>
              <p className="font-extrabold text-slate-800 dark:text-slate-200">{company.ukuran || 'Tidak disebutkan'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800/40 border border-[#C2E5EF] dark:border-slate-700/50 text-center">
              <Calendar size={24} className="mx-auto text-[#2596be] mb-2" />
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Tahun Berdiri</p>
              <p className="font-extrabold text-slate-800 dark:text-slate-200">{company.tahun_berdiri || '-'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800/40 border border-[#C2E5EF] dark:border-slate-700/50 text-center">
              <MapPin size={24} className="mx-auto text-[#2596be] mb-2" />
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Kantor Pusat</p>
              <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate">{company.kota || '-'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 text-center">
              <Briefcase size={24} className="mx-auto text-cyan-600 dark:text-cyan-400 mb-2" />
              <p className="text-[10px] sm:text-xs text-cyan-700 dark:text-cyan-500 uppercase tracking-wider font-bold mb-1">Lowongan Aktif</p>
              <p className="font-black text-cyan-800 dark:text-cyan-300 text-lg">{company.jobs_count}</p>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <Info className="text-[#2596be]" size={24} />
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Tentang Perusahaan</h3>
              </div>
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                {company.deskripsi || 'Belum ada deskripsi yang ditambahkan oleh perusahaan.'}
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="text-[#2596be]" size={24} />
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Alamat Lengkap</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {company.alamat ? `${company.alamat}, ${company.kota}, ${company.provinsi}` : 'Alamat lengkap belum ditambahkan.'}
              </p>
            </div>
          </div>
          
          {/* Right Column: Active Jobs */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Briefcase size={20} className="text-[#2596be]"/> Loker Aktif
              </h3>
              <span className="w-8 h-8 rounded-full bg-[#E0F1F7] text-[#2596be] font-bold flex items-center justify-center text-xs">
                {company.jobs_count}
              </span>
            </div>
            
            {(!company.jobs || company.jobs.length === 0) ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 mx-auto flex items-center justify-center mb-4">
                  <Briefcase size={28} className="text-slate-300" />
                </div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-1">Belum ada lowongan</h4>
                <p className="text-xs text-slate-500">Perusahaan ini sedang tidak membuka lowongan pekerjaan baru.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {company.jobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-[#2596be]/50 transition-all cursor-pointer group"
                    onClick={() => router.push(`/applicant/dashboard?view=recommended&jobId=${job.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-base group-hover:text-[#2596be] transition-colors leading-snug">
                        {job.judul_posisi}
                      </h4>
                      <ExternalLink size={16} className="text-slate-300 group-hover:text-[#2596be] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                    </div>
                    <div className="space-y-2 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#2596be]" /> {job.kota} ({job.lokasi_kerja === 'remote' ? 'Remote' : 'On-site'})
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={14} className="text-[#2596be]" /> {job.experience_level || 'Semua Level'}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                        {job.tipe_pekerjaan ? job.tipe_pekerjaan.split('_').join(' ').toUpperCase() : 'FULL TIME'}
                      </span>
                      <span className="text-xs font-black text-[#2596be]">Lihat Detail &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
