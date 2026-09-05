'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import Footer from '@/components/Footer';
import {
  HelpCircle,
  Eye,
  EyeOff,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpRedirect, setShowOtpRedirect] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (!password) {
      setError('Masukkan password akun Anda.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password, role: 'pelamar' });

      // Security check: Email Verification
      if (res.is_verified === false || res.is_email_verified === false) {
        setError('Email Anda belum diverifikasi dengan kode OTP. Silakan lakukan verifikasi OTP terlebih dahulu.');
        setShowOtpRedirect(true);
        setIsLoading(false);
        return;
      }

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
      const errText = parseErrorMessage(err);
      setError(errText);
      if (errText.toLowerCase().includes('otp') || errText.toLowerCase().includes('verifikasi')) {
        setShowOtpRedirect(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans antialiased transition-colors duration-300">

      {/* Top Header */}
      <header className="py-6 px-6 sm:px-12 max-w-[1600px] w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white leading-none">
              AI-RecruitPro
            </span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
              {t.pelamar.header.portalName}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-semibold text-[#1A4B9F] hover:underline flex items-center gap-1.5"
          >
            <Building2 size={16} />
            {t.pelamar.header.forEmployers}
          </Link>
        </div>
      </header>

      {/* Main Centered Sign In Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-7 relative">

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.pelamar.auth.loginTitle}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.pelamar.auth.loginSubtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <label htmlFor="email">{t.pelamar.auth.emailLabel}</label>
                <button type="button" className="text-[#1A4B9F] dark:text-blue-400 hover:underline flex items-center gap-1">
                  <HelpCircle size={14} /> {t.pelamar.auth.help}
                </button>
              </div>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder={t.pelamar.auth.emailPlaceholder}
                className="w-full px-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.pelamar.auth.passwordLabel}
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full px-4 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex flex-col gap-2 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <span>{error}</span>
                </div>
                {showOtpRedirect && (
                  <Link
                    href="/applicant/register"
                    className="text-[#1A4B9F] dark:text-blue-400 font-bold underline hover:text-blue-900 dark:hover:text-blue-300 text-[11px] self-start ml-6"
                  >
                    Verifikasi Kode OTP Sekarang &rarr;
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-semibold text-sm shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? t.pelamar.auth.processing : t.pelamar.auth.signIn}
            </button>
          </form>

          {/* Bottom Switch to Register */}
          <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
            {t.pelamar.auth.noAccount}{' '}
            <Link href="/applicant/register" className="font-semibold text-[#1A4B9F] dark:text-blue-400 hover:underline">
              {t.pelamar.auth.registerNow}
            </Link>
          </div>

        </div>
      </main>

      <Footer />

    </div>
  );
}
