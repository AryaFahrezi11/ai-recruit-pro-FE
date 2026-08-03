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

export default function PelamarLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInstantDirectLogin = () => {
    setIsLoading(true);
    // Directly set authentication session state in localStorage
    localStorage.setItem('isPelamarLoggedIn', 'true');

    setTimeout(() => {
      setIsLoading(false);
      router.push('/pelamar/dashboard');
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleInstantDirectLogin();
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

          {/* Social Auth Options (Direct Login) */}
          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={handleInstantDirectLogin}
              type="button"
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-[#1b7b9e] dark:hover:border-cyan-400 bg-white dark:bg-slate-800 hover:bg-[#F0F8FB] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 shadow-2xs group"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29c-.8 1.6-1.26 3.4-1.26 5.42s.46 3.82 1.26 5.42l3.99-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleInstantDirectLogin}
              type="button"
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-[#1b7b9e] dark:hover:border-cyan-400 bg-white dark:bg-slate-800 hover:bg-[#F0F8FB] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 shadow-2xs group"
            >
              <svg className="w-5 h-5 text-[#1877F2] fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Lanjutkan dengan Facebook</span>
            </button>

            {/* Apple */}
            <button
              onClick={handleInstantDirectLogin}
              type="button"
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-[#1b7b9e] dark:hover:border-cyan-400 bg-white dark:bg-slate-800 hover:bg-[#F0F8FB] dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 shadow-2xs group"
            >
              <svg className="w-5 h-5 text-black dark:text-white fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.12-1.96.99-3.1-.96.04-2.13.64-2.82 1.45-.62.72-1.16 1.88-1.01 3 .07.01.14.02.21.02 1.05 0 2.14-.55 2.63-1.37z" />
              </svg>
              <span>Lanjutkan dengan Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            <span className="absolute bg-white dark:bg-slate-900 px-4 text-xs font-semibold text-slate-400">atau</span>
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900 rounded-2xl text-sm outline-none transition-all dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.pelamar.auth.signIn}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Bottom Switch to Register */}
          <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
            {t.pelamar.auth.noAccount}{' '}
            <Link href="/pelamar/register" className="font-extrabold text-[#1b7b9e] dark:text-cyan-400 hover:underline">
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
