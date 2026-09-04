'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import Footer from '@/components/Footer';

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
  const { t } = useTranslation();

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
      setError(t.employerAuth.errorInvalidEmail);
      return;
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (freeEmailDomains.includes(domain)) {
      setError(t.employerAuth.errorFreeEmail);
      return;
    }

    if (!password) {
      setError(t.employerAuth.errorNoPassword);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await loginUser(email, password, 'perusahaan');
      
      // Strict role check
      if (response.user.role !== 'perusahaan') {
        setError(t.employerAuth.errorNotCorporate);
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

      toast.success(t.employerAuth.loginSuccess);
      
      // Jika Anda menggunakan app/(perusahaan)/dashboard atau app/dashboard
      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err.message === 'Failed to fetch' 
        ? t.employerAuth.errorNetwork
        : (err.message || t.employerAuth.errorGeneric);
      setError(errorMsg);
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
              {t.employerAuth.loginTitle}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">

          <Link
            href="/applicant/login"
            className="text-xs sm:text-sm font-semibold text-[#1A4B9F] hover:underline flex items-center gap-1.5"
          >
            {t.employerAuth.applicantPortal}
          </Link>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-7 relative">

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.employerAuth.loginTitle}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.employerAuth.loginSubtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Input */}
            <div className="space-y-1">
              <label htmlFor="company-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.employerAuth.emailLabel}
              </label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  id="company-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('company-password')?.focus();
                    }
                  }}
                  placeholder={t.employerAuth.emailPlaceholder}
                  className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 rounded-2xl text-sm outline-none transition-all ${error ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900'
                    }`}
                />
              </div>
              <span className="text-[11px] text-slate-400 block pt-0.5">
                {t.employerAuth.emailHelp}
              </span>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <label htmlFor="company-password">{t.employerAuth.passwordLabel}</label>
                <a href="#forgot" className="text-[#1A4B9F] hover:underline text-[11px]">{t.employerAuth.forgotPassword}</a>
              </div>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                <input
                  id="company-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('submit-btn')?.click();
                    }
                  }}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
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
              id="submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white font-semibold text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>{t.employerAuth.processing}</span>
              ) : (
                <>
                  <span>{t.employerAuth.signIn}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-3">
            <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {t.employerAuth.noAccount}{' '}
              <Link href="/register" className="font-semibold text-[#1A4B9F] hover:underline block sm:inline mt-1 sm:mt-0">
                {t.employerAuth.registerNow}
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />

    </div>
  );
}
