'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import {
  HelpCircle,
  ArrowRight,
  Building2
} from 'lucide-react';
import { api, parseErrorMessage } from '@/lib/api';

export default function PelamarLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (!password) {
      setError('Masukkan kata sandi akun Anda.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password, role: 'pelamar' });

      const token = res.access_token;
      const role = res.role;
      const userId = res.user_id;

      if (token) {
        const previousEmail = localStorage.getItem('user_email');
        if (previousEmail && previousEmail !== email) {
          localStorage.removeItem('candidateCvData');
          localStorage.removeItem('candidateCvCreated');
        }
        localStorage.setItem('access_token', token);
        localStorage.setItem('user_role', role || 'pelamar');
        localStorage.setItem('user_id', userId || '');
        localStorage.setItem('user_email', email);
        localStorage.setItem('isPelamarLoggedIn', 'true');
        router.push('/applicant/dashboard');
      } else {
        setError('Respon login tidak valid.');
      }
    } catch (err: any) {
      setError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F8FB] dark:bg-slate-950 text-[#1b7b9e] dark:text-cyan-400 flex flex-col justify-between font-sans antialiased">

      {/* Top Header */}
      <header className="py-6 px-6 sm:px-12 max-w-[1600px] w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#2596be] text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
            RP
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-[#2596be] leading-none">
              AI-Recruit <span className="text-[#1D7FA1]">Pro</span>
            </span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
              {t.pelamar.header.portalName}
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="text-xs sm:text-sm font-bold text-[#1b7b9e] hover:underline flex items-center gap-1.5"
        >
          <Building2 size={16} />
          {t.pelamar.header.forEmployers}
        </Link>
      </header>

      {/* Main Centered Sign In Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#C2E5EF] dark:border-slate-800 space-y-7 relative">

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#1b7b9e] dark:text-cyan-400">{t.pelamar.auth.loginTitle}</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.pelamar.auth.loginSubtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <label htmlFor="email">{t.pelamar.auth.emailLabel}</label>
                <button type="button" className="text-[#1b7b9e] dark:text-cyan-400 hover:underline flex items-center gap-1">
                  <HelpCircle size={14} /> Bantuan
                </button>
              </div>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900 rounded-2xl text-sm outline-none transition-all dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900 rounded-2xl text-sm outline-none transition-all dark:text-white"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoading ? 'Memproses Masuk...' : t.pelamar.auth.signIn}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Bottom Switch to Register */}
          <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
            {t.pelamar.auth.noAccount}{' '}
            <Link href="/applicant/register" className="font-extrabold text-[#1b7b9e] dark:text-cyan-400 hover:underline">
              {t.pelamar.auth.registerNow}
            </Link>
          </div>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 border-t border-[#C4E3ED] dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} AI-Recruit Pro Candidate Portal. Seluruh hak cipta dilindungi.
      </footer>

    </div>
  );
}
