'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { loginUser } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';
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

  const setToken = useAppStore((state) => state.setToken);
  const setUser = useAppStore((state) => state.setUser);

  // Block free email providers for corporate HR portal
  const freeEmailDomains = [
    'gmail.com', 'yahoo.com', 'yahoo.co.id', 'ymail.com',
    'hotmail.com', 'outlook.com', 'live.com', 'icloud.com'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      const response = await loginUser(email, password, 'perusahaan');
      
      // Strict role check
      if (response.user.role !== 'perusahaan') {
        setError('Akses ditolak. Akun Anda bukan akun perusahaan.');
        setIsLoading(false);
        return;
      }
      
      setToken(response.access_token);
      setUser(response.user);
      
      // Save to localStorage for api.ts helper compatibility
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user_role', response.user.role);
        localStorage.setItem('user_email', email);
        localStorage.setItem('isPerusahaanLoggedIn', 'true');
      }

      toast.success('Login Perusahaan Berhasil');
      
      // Jika Anda menggunakan app/(perusahaan)/dashboard atau app/dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err.message === 'Failed to fetch' 
        ? 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' 
        : (err.message || 'Gagal login. Periksa kembali email dan kata sandi.');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F8FB] text-[#1b7b9e] flex flex-col justify-between font-sans antialiased">

      {/* Top Header */}
      <header className="py-6 px-6 sm:px-12 max-w-[1600px] w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#1b7b9e] text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
            RP
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-[#0c2b3d] leading-none">
              AI-Recruit <span className="text-[#1D7FA1]">Pro</span>
            </span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
              Employer Portal (HRD)
            </span>
          </div>
        </Link>

        <Link
          href="/applicant/login"
          className="text-xs sm:text-sm font-bold text-[#1b7b9e] hover:underline flex items-center gap-1.5"
        >
          Applicant Portal &rarr;
        </Link>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#C2E5EF] space-y-7 relative">

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E0F1F7] text-[#1b7b9e] text-xs font-extrabold border border-[#B8E1ED]">
              <Building2 size={14} /> For Recruiters &amp; HR
            </div>
            <h1 className="text-3xl font-black text-[#1b7b9e]">Login to Employer Portal</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Kelola proses hiring, kandidat PO-FIT, dan AI screening.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Input */}
            <div className="space-y-1">
              <label htmlFor="company-email" className="block text-xs font-bold text-slate-700">
                Official Company Email
              </label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  id="company-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="hrd@namaperusahaan.com"
                  className={`w-full pl-12 pr-4 py-3 bg-white border-2 rounded-2xl text-sm outline-none transition-all ${error ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-300 focus:border-[#1b7b9e] focus:ring-2 focus:ring-cyan-100'
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
                <a href="#forgot" className="text-[#1b7b9e] hover:underline text-[11px]">Lupa Sandi?</a>
              </div>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  id="company-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-300 focus:border-[#1b7b9e] focus:ring-2 focus:ring-cyan-100 rounded-2xl text-sm outline-none transition-all"
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
              className="w-full py-3.5 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>{isLoading ? 'Processing...' : 'Sign In'}</span>
              ) : (
                <>
                  <span>Masuk ke Dashboard HR</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center space-y-3">
            <div className="text-xs text-slate-600 font-medium">
              Perusahaan Anda belum terdaftar?{' '}
              <Link href="/register" className="font-extrabold text-[#1b7b9e] hover:underline block sm:inline mt-1 sm:mt-0">
                Register &amp; Verifikasi Legalitas &rarr;
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#C2E5EF] bg-white text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} AI-Recruit Pro Corporate Engine. Verified Business Authentication.
      </footer>

    </div>
  );
}
