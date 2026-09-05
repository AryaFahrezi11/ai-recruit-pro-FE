'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import Footer from '@/components/Footer';
import { useAppStore } from '@/lib/store/useAppStore';
import { loginUser } from '@/lib/api/auth';
import { api, parseErrorMessage } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  KeyRound,
  ArrowLeft,
  User
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

  // OTP Verification state for unverified accounts
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Block free email providers for corporate HR portal (Gmail, Yahoo, etc.)
  // Explicitly allow .ac.id for testing
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
    const isAcId = domain?.endsWith('.ac.id') || domain === 'ac.id';
    
    // Block standard free consumer emails, but allow corporate domains and .ac.id
    if (freeEmailDomains.includes(domain) && !isAcId) {
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

      // Check kelengkapan data diri dan dokumen (Tahap 3 register perusahaan)
      if (response.has_completed_profile === false) {
        toast.error('Data diri perusahaan dan dokumen legalitas (Tahap 3) belum lengkap. Mengalihkan ke form kelengkapan...');
        router.push('/register?step=3');
        return;
      }

      // Check verifikasi persetujuan admin
      if (response.is_verified === false) {
        toast('Akun perusahaan Anda sedang dalam proses peninjauan dokumen oleh Admin.', { icon: '⏳', duration: 5000 });
        router.push('/pending-approval');
        return;
      }

      toast.success(t.employerAuth.loginSuccess);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err.message === 'Failed to fetch' 
        ? t.employerAuth.errorNetwork
        : (err.message || t.employerAuth.errorGeneric);
      
      setError(errorMsg);

      // Check if the account needs OTP verification
      if (
        errorMsg.toLowerCase().includes('otp') ||
        errorMsg.toLowerCase().includes('belum aktif')
      ) {
        setShowOtpStep(true);
        setOtpError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`company-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpCode.join('');
    if (enteredOtp.length < 6) {
      setOtpError('Harap masukkan 6 digit kode OTP yang dikirimkan ke email Anda.');
      return;
    }

    setOtpError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', {
        email,
        otp_code: enteredOtp
      });

      if (res.access_token) {
        setToken(res.access_token);
        setUser({ id: res.user_id, role: res.role || 'perusahaan', email });
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('user_role', res.role || 'perusahaan');
        localStorage.setItem('user_id', res.user_id || '');
        localStorage.setItem('user_email', email);
        localStorage.setItem('isPerusahaanLoggedIn', 'true');
      }

      // Check kelengkapan data diri dan dokumen (Tahap 3)
      if (res.has_completed_profile === false) {
        toast.success('Kode OTP berhasil diverifikasi! Harap lengkapi data diri perusahaan dan dokumen di Tahap 3.');
        router.push('/register?step=3');
        return;
      }

      // Check persetujuan admin
      if (res.is_verified === false) {
        toast('Kode OTP diverifikasi. Akun Anda sedang menunggu peninjauan dokumen oleh Admin.', { icon: '⏳', duration: 5000 });
        router.push('/pending-approval');
        return;
      }

      toast.success('Akun perusahaan berhasil diverifikasi! Mengalihkan ke dashboard...');
      router.push('/dashboard');
    } catch (err: any) {
      setOtpError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending || countdown > 0) return;
    setIsResending(true);
    setOtpError('');
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('Kode OTP baru berhasil dikirimkan ke email Anda.');
      setCountdown(60);
    } catch (err: any) {
      setOtpError(parseErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans antialiased transition-colors duration-300">

      {/* Top Header */}
      <header className="py-6 px-6 sm:px-12 max-w-[1600px] w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/Logo Ai Recruit Pro..png"
            alt="AI-RecruitPro Logo"
            width={70}
            height={70}
            className="h-13 sm:h-15 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
            priority
          />
          <div className="flex flex-col justify-center">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-tight">
              AI-RecruitPro
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mt-0.5">
              Masuk ke Akun Perusahaan
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/applicant/login"
            className="text-xs sm:text-sm font-semibold text-[#1A4B9F] hover:underline flex items-center gap-1.5"
          >
            <User size={16} />
            {t.employerAuth.applicantPortal}
          </Link>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-7 relative">

          {!showOtpStep ? (
            <>
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
                      placeholder="nama@perusahaan.com / nama@kampus.ac.id"
                      className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 rounded-2xl text-sm outline-none transition-all ${error ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900'
                        }`}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 block pt-0.5">
                    Masukkan email resmi perusahaan atau domain .ac.id (diperbolehkan untuk testing).
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
                  className="w-full py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white font-semibold text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
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
            </>
          ) : (
            /* OTP Verification Screen for Unverified Company Account */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="space-y-2 text-center">
                <div className="w-14 h-14 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 mx-auto">
                  <KeyRound size={28} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verifikasi OTP Perusahaan</h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Akun perusahaan Anda belum aktif. Masukkan 6 digit kode OTP yang telah dikirimkan ke email: <strong className="text-[#1A4B9F] dark:text-blue-400 block break-all">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex justify-center items-center gap-2 sm:gap-3">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`company-otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all"
                    />
                  ))}
                </div>

                {otpError && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold text-center">
                    {otpError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Memverifikasi...</span>
                  ) : (
                    <>
                      <span>Verifikasi &amp; Masuk Dashboard</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowOtpStep(false); setError(''); }}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Login</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending || countdown > 0}
                    className="font-bold text-[#1A4B9F] dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                  >
                    {countdown > 0 ? `Kirim ulang (${countdown}s)` : isResending ? 'Mengirim...' : 'Kirim Ulang OTP'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>

      <Footer />

    </div>
  );
}
