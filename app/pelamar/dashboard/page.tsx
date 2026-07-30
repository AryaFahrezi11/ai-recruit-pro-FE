'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Video, 
  ShieldCheck, 
  ArrowRight, 
  Briefcase, 
  Building2, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Sparkles, 
  Info,
  Clock,
  Layers,
  Award,
  Edit3,
  Check,
  Send,
  Zap,
  Star
} from 'lucide-react';

export default function CandidateDashboardPage() {
  const router = useRouter();
  const [hasCv, setHasCv] = useState(true);
  const [cvDetails, setCvDetails] = useState<any>(null);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);

  useEffect(() => {
    const savedCv = localStorage.getItem('candidateCvData');
    if (savedCv) {
      setCvDetails(JSON.parse(savedCv));
      setHasCv(true);
    } else {
      setCvDetails({
        fullName: 'Budi Pratama',
        jobTitle: 'Senior Frontend Engineer',
        skills: 'React, Next.js, TypeScript, Tailwind CSS',
        updatedAt: '29 Juli 2026'
      });
    }

    const savedApplied = localStorage.getItem('appliedJobsList');
    if (savedApplied) {
      setAppliedJobs(JSON.parse(savedApplied));
    }
  }, []);

  const handleApplyWithCv = (jobId: number, companyName: string, title: string) => {
    const newApplied = [...appliedJobs, jobId];
    setAppliedJobs(newApplied);
    localStorage.setItem('appliedJobsList', JSON.stringify(newApplied));

    alert(`🎉 Sukses! CV ATS-Friendly Anda ("${cvDetails?.fullName || 'Budi Pratama'}") telah otomatis dikirimkan ke HR ${companyName} untuk posisi ${title}.`);
    
    // Redirect candidate to Status Tracker page to monitor AI Screening score
    router.push('/pelamar/status');
  };

  // Recommended Jobs automatically tailored to candidate CV
  const matchedJobs = [
    {
      id: 101,
      title: 'Senior Frontend Engineer (AI Solutions)',
      company: 'PT Tech Inovasi Nusantara',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
      location: 'Jakarta Selatan',
      workType: 'Hybrid',
      salary: 'Rp 18.000.000 - Rp 25.000.000',
      matchScore: 92,
      skillsMatched: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      reason: 'Sangat cocok dengan keahlian Next.js & TypeScript di CV ATS Anda.'
    },
    {
      id: 102,
      title: 'AI & Data Science Specialist',
      company: 'Nusantara Intelligence Corp',
      logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=120&auto=format&fit=crop&q=80',
      location: 'Bandung',
      workType: 'Remote',
      salary: 'Rp 20.000.000 - Rp 30.000.000',
      matchScore: 95,
      skillsMatched: ['Python', 'NLP', 'PyTorch'],
      reason: 'Pengalaman & sertifikasi Anda memenuhi ambang batas kualifikasi AI.'
    },
    {
      id: 103,
      title: 'Fullstack Developer (React & Node.js)',
      company: 'Fintech Utama Indonesia',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
      location: 'Surabaya',
      workType: 'Hybrid',
      salary: 'Rp 14.000.000 - Rp 20.000.000',
      matchScore: 88,
      skillsMatched: ['React', 'Node.js', 'REST API'],
      reason: 'Pengalaman 4 tahun Anda sesuai dengan kualifikasi senior tim engineering.'
    }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] w-full mx-auto">

      {/* Welcome Banner */}
      <div className="bg-[#2596be] rounded-3xl p-8 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E0F1F7] text-[#2596be] text-xs font-bold shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#2596be]" />
            Portal Pelamar PO-FIT AI
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Selamat Datang, {cvDetails?.fullName || 'Budi Pratama'}
          </h1>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            Sistem AI kami telah mencocokkan CV ATS-Friendly Anda dengan beberapa posisi lowongan terbaik di bawah ini. Anda dapat melamar langsung dengan 1 klik!
          </p>
        </div>
      </div>

      {/* Candidate ATS CV Status Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#C2E5EF] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#E0F1F7] border border-[#B8E1ED] text-[#2596be] flex items-center justify-center font-bold shrink-0">
            <FileText className="w-8 h-8 text-[#2596be]" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#2596be] bg-[#E0F1F7] px-3 py-0.5 rounded-full border border-[#B8E1ED]">
                CV ATS-Friendly Ready
              </span>
              <span className="text-xs text-slate-400">Diperbarui: {cvDetails?.updatedAt || 'Hari ini'}</span>
            </div>
            <h2 className="text-xl font-bold text-[#2596be]">
              {cvDetails?.jobTitle || 'Senior Frontend Engineer'} — {cvDetails?.fullName || 'Budi Pratama'}
            </h2>
            <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
              Keahlian: {cvDetails?.skills || 'React, Next.js, TypeScript, Tailwind CSS'}
            </p>
          </div>
        </div>

        <Link
          href="/pelamar/upload-cv"
          className="px-6 py-2.5 rounded-full border-2 border-[#2596be] text-[#2596be] hover:bg-[#E0F1F7] text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Edit3 size={16} /> Edit / Kelola CV ATS
        </Link>
      </div>

      {/* AUTOMATED RECOMMENDED JOBS TAILORED TO CV */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#C2E5EF] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E0F1F7] text-[#2596be] text-xs font-extrabold mb-1">
              <Zap size={14} className="fill-current" /> Rekomendasi Otomatis Berbasis AI
            </div>
            <h2 className="text-2xl font-black text-[#2596be]">
              Lowongan Kerja Yang Cocok Dengan CV Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pelamar tidak perlu mencari manual. Sistem PO-FIT AI telah menganalisis kualifikasi CV Anda.
            </p>
          </div>

          <Link href="/pelamar/status" className="text-xs font-bold text-[#2596be] hover:underline flex items-center gap-1">
            Lihat Status Lamaran Saya &rarr;
          </Link>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 gap-6">
          {matchedJobs.map((job) => {
            const isApplied = appliedJobs.includes(job.id);

            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-[#C2E5EF] p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xs hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-5">
                  <img src={job.logo} alt={job.company} className="w-14 h-14 rounded-2xl object-cover border border-[#C2E5EF] shrink-0" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-bold text-slate-500">{job.company}</span>
                      <span className="text-xs font-extrabold text-[#2596be] bg-[#E0F1F7] px-3 py-0.5 rounded-full border border-[#B8E1ED]">
                        ✨ {job.matchScore}% Match PO-FIT
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#2596be]">{job.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {job.location} ({job.workType})</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#2596be] font-bold"><DollarSign size={14} /> {job.salary}</span>
                    </div>

                    <p className="text-xs text-slate-600 bg-[#F0F8FB] p-2.5 rounded-xl border border-[#C2E5EF] leading-relaxed">
                      💡 <strong>Alasan AI Match:</strong> {job.reason}
                    </p>
                  </div>
                </div>

                {/* Apply CTA Button */}
                <div className="w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
                  {isApplied ? (
                    <div className="px-6 py-3 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> Lamaran &amp; CV Terkirim
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApplyWithCv(job.id, job.company, job.title)}
                      className="w-full lg:w-auto px-8 py-3.5 rounded-full bg-[#2596be] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <Send size={16} />
                      Lamar Otomatis Dengan CV ATS
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
