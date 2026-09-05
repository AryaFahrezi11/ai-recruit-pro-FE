'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import Footer from '@/components/Footer';
import { toast } from 'react-hot-toast';
import {
  HelpCircle,
  ArrowRight,
  Building2,
  KeyRound,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { api, parseErrorMessage } from '@/lib/api';

export default function PelamarLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Unverified account OTP modal/step state
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
      const parsed = parseErrorMessage(err);
      setError(parsed);

      // Detect unverified account requiring OTP
      if (
        err?.status === 403 ||
        parsed.toLowerCase().includes('otp') ||
        parsed.toLowerCase().includes('belum aktif')
      ) {
        // Automatically switch to OTP step so applicant can enter their OTP
        setShowOtpStep(true);
        setOtpError(parsed);
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

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
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

      // Clear previous CV data on fresh verification
      localStorage.removeItem('candidateCvData');
      localStorage.removeItem('candidateCvCreated');

      if (res.access_token) {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('user_role', res.role || 'pelamar');
        localStorage.setItem('user_id', res.user_id || '');
      }
      localStorage.setItem('user_email', email);
      localStorage.setItem('isPelamarLoggedIn', 'true');

      toast.success('Akun berhasil diverifikasi! Mengalihkan ke dashboard...');
      router.push('/applicant/dashboard');
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

          {/* STEP 1: Standard Login Form */}
          {!showOtpStep ? (
            <>
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
                    <button type="button" className="text-[#1A4B9F] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer">
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
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                  />
                </div>

                {error && (
                  <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isLoading ? t.pelamar.auth.processing : t.pelamar.auth.signIn}</span>
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </form>

              {/* Bottom Switch to Register */}
              <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
                {t.pelamar.auth.noAccount}{' '}
                <Link href="/applicant/register" className="font-semibold text-[#1A4B9F] dark:text-blue-400 hover:underline">
                  {t.pelamar.auth.registerNow}
                </Link>
              </div>
            </>
          ) : (
            /* STEP 2: Required OTP Verification Form */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="space-y-2 text-center">
                <div className="w-14 h-14 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 mx-auto">
                  <KeyRound size={28} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verifikasi OTP Diperlukan</h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Akun Anda belum aktif. Masukkan 6 digit kode OTP yang telah dikirimkan ke email: <strong className="text-[#1A4B9F] dark:text-blue-400 block break-all">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* 6 Digit Inputs */}
                <div className="flex justify-center items-center gap-2 sm:gap-3">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`login-otp-${idx}`}
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
