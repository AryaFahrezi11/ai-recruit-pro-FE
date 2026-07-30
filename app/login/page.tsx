'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function CompanyLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Block free email providers for corporate HR portal
  const freeEmailDomains = [
    'gmail.com', 'yahoo.com', 'yahoo.co.id', 'ymail.com', 
    'hotmail.com', 'outlook.com', 'live.com', 'icloud.com'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Masukkan alamat email perusahaan yang valid.');
      return;
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (freeEmailDomains.includes(domain)) {
      setError('Akses ditolak. Portal Perusahaan wajib menggunakan Email Resmi Perusahaan (contoh: hrd@tokopedia.com, recruitment@bankmandiri.co.id), bukan email pribadi (Gmail/Yahoo).');
      return;
    }

    if (!password) {
      setError('Masukkan kata sandi akun Anda.');
      return;
    }

    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem('isPerusahaanLoggedIn', 'true');
      router.push('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F4FDFB] text-[#0F766E] flex flex-col justify-between font-sans antialiased">
      
      {/* Top Header */}
      <header className="py-6 px-6 sm:px-12 max-w-[1600px] w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#0F766E] text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
            RP
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-[#0F766E] leading-none">
              AI-Recruit <span className="text-[#0D635C]">Pro</span>
            </span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
              Portal Perusahaan (HRD)
            </span>
          </div>
        </Link>

        <Link 
          href="/pelamar/login" 
          className="text-xs sm:text-sm font-bold text-[#0F766E] hover:underline flex items-center gap-1.5"
        >
          Portal Pelamar Kerja &rarr;
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#CCFBF1] space-y-7 relative">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6FFFA] text-[#0F766E] text-xs font-extrabold border border-[#99F6E4]">
              <Building2 size={14} /> Khusus Rekruter &amp; HRD Perusahaan
            </div>
            <h1 className="text-3xl font-black text-[#0F766E]">Masuk Portal Perusahaan</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Kelola proses rekrutmen, kandidat PO-FIT, dan evaluasi hasil analisis AI.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Input */}
            <div className="space-y-1">
              <label htmlFor="company-email" className="block text-xs font-bold text-slate-700">
                Email Perusahaan Resmi
              </label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  id="company-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="hrd@namaperusahaan.com"
                  className={`w-full pl-12 pr-4 py-3 bg-white border-2 rounded-2xl text-sm outline-none transition-all ${
                    error ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-300 focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100'
                  }`}
                />
              </div>
              <span className="text-[11px] text-slate-400 block pt-0.5">
                Contoh: hrd@tokopedia.com, recruitment@bankmandiri.co.id
              </span>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <label htmlFor="company-password">Kata Sandi</label>
                <a href="#forgot" className="text-[#0F766E] hover:underline text-[11px]">Lupa Sandi?</a>
              </div>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  id="company-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-300 focus:border-[#0F766E] focus:ring-2 focus:ring-teal-100 rounded-2xl text-sm outline-none transition-all"
                />
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 leading-relaxed">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-[#0F766E] hover:bg-[#0D635C] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Memproses Masuk...</span>
              ) : (
                <>
                  <span>Masuk ke Dashboard HR</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="pt-2 border-t border-slate-100 text-center space-y-3">
            <button
              onClick={() => {
                setEmail('hrd@tokopedia.com');
                setPassword('password123');
                setError('');
              }}
              className="text-xs font-bold text-[#0F766E] bg-[#E6FFFA] hover:bg-[#CCFBF1] px-4 py-2 rounded-full border border-[#99F6E4] transition-colors"
            >
              ⚡ Isikan Email Demo (hrd@tokopedia.com)
            </button>

            <div className="text-xs text-slate-600 font-medium">
              Perusahaan Anda belum terdaftar?{' '}
              <Link href="/register" className="font-extrabold text-[#0F766E] hover:underline block sm:inline mt-1 sm:mt-0">
                Daftar &amp; Verifikasi Legalitas &rarr;
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#CCFBF1] bg-white text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} AI-Recruit Pro Corporate Engine. Verified Business Authentication.
      </footer>

    </div>
  );
}
