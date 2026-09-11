'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/lib/store/useAppStore';

import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  X,
  ShieldCheck,
  ShieldBan,
  User
} from 'lucide-react';
import { api, parseErrorMessage, setAuthToken } from '@/lib/api';
import { toast } from 'react-hot-toast';

type LoginMode = 'login' | 'unverified_otp' | 'forgot_email' | 'forgot_otp' | 'forgot_new_password';

export default function CompanyLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const setUser = useAppStore((state) => state.setUser);

  const [mode, setMode] = useState<LoginMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Unverified Company OTP State
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''));
  const [otpError, setOtpError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Forgot / Reset Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [resetError, setResetError] = useState('');

  // Password requirements validator
  const checkPasswordStrength = (pwd: string) => {
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
    };
  };

  const strength = checkPasswordStrength(newPassword);
  const isValidNewPassword = Object.values(strength).every(Boolean);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 1. Handle Company Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Masukkan email resmi perusahaan yang valid.');
      return;
    }
    if (!password) {
      setError('Masukkan password akun perusahaan Anda.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password, role: 'perusahaan' });
      const data = res.data || res;

      if (data.access_token) {
        setAuthToken(data.access_token);
        useAppStore.getState().setToken(data.access_token);
        const userRole = data.role || data.user?.role || 'perusahaan';
        const userId = String(data.user_id || data.user?.id || '');

        localStorage.setItem('user_role', userRole);
        localStorage.setItem('user_id', userId);
        localStorage.setItem('user_email', email);
        localStorage.setItem('isPerusahaanLoggedIn', 'true');

        const userObj = {
          id: userId,
          name: data.user?.name || email.split('@')[0] || 'Perusahaan',
          email: email,
          role: userRole,
        };

        setUser(userObj);
        useAppStore.getState().setUser(userObj);
        toast.success('Berhasil masuk ke Dashboard Perusahaan.');
        router.push('/dashboard');
      } else {
        setError('Token autentikasi tidak ditemukan.');
      }
    } catch (err: any) {
      const errorMsg = parseErrorMessage(err);
      const lowerMsg = (errorMsg || '').toLowerCase();

      const isBanned =
        lowerMsg.includes('ban') ||
        lowerMsg.includes('banned') ||
        lowerMsg.includes('blokir') ||
        lowerMsg.includes('diblokir') ||
        lowerMsg.includes('suspended') ||
        lowerMsg.includes('ditangguhkan') ||
        lowerMsg.includes('dinonaktifkan') ||
        lowerMsg.includes('nonaktif') ||
        lowerMsg.includes('non-aktif') ||
        lowerMsg.includes('deactivated') ||
        lowerMsg.includes('disabled');

      const isUnverified =
        !isBanned &&
        (lowerMsg.includes('otp') ||
        lowerMsg.includes('belum aktif') ||
        lowerMsg.includes('belum diverifikasi') ||
        lowerMsg.includes('verifikasi') ||
        lowerMsg.includes('memasukkan kode'));

      if (isBanned) {
        setError(errorMsg || 'Akun Anda telah dibanned/diblokir oleh Admin. Anda tidak dapat masuk atau mendaftar kembali dengan email ini.');
      } else if (isUnverified) {
        setMode('unverified_otp');
        setOtpError(errorMsg);
        setCountdown(60);
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Unverified OTP Verification
  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue && value !== '') return;

    const newOtp = [...otpCode];
    newOtp[index] = cleanValue.slice(-1);
    setOtpCode(newOtp);
    setOtpError('');

    if (cleanValue && index < 5) {
      const nextInput = document.getElementById(`company-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, prefix: string = 'company-otp') => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otpCode];

      if (otpCode[index]) {
        newOtp[index] = '';
        setOtpCode(newOtp);
        if (index > 0) {
          const prevInput = document.getElementById(`${prefix}-${index - 1}`);
          if (prevInput) prevInput.focus();
        }
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtpCode(newOtp);
        const prevInput = document.getElementById(`${prefix}-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
      return;
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const prevInput = document.getElementById(`${prefix}-${index - 1}`);
      if (prevInput) prevInput.focus();
    }

    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      const nextInput = document.getElementById(`${prefix}-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>, prefix: string = 'company-otp') => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = ['', '', '', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtpCode(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      const targetInput = document.getElementById(`${prefix}-${focusIndex}`);
      if (targetInput) targetInput.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpCode.join('');

    if (fullOtp.length < 6) {
      setOtpError('Masukkan 6-digit kode OTP secara lengkap.');
      return;
    }

    setIsLoading(true);
    setOtpError('');

    try {
      const res = await api.post('/auth/verify-otp', {
        email,
        otp_code: fullOtp
      });

      const data = res.data || res;

      if (data.access_token) {
        setAuthToken(data.access_token);
        useAppStore.getState().setToken(data.access_token);
        const userRole = data.role || data.user?.role || 'perusahaan';
        const userId = String(data.user_id || data.user?.id || '');

        localStorage.setItem('user_role', userRole);
        localStorage.setItem('user_id', userId);
        localStorage.setItem('user_email', email);
        localStorage.setItem('isPerusahaanLoggedIn', 'true');

        const userObj = {
          id: userId,
          name: data.user?.name || email.split('@')[0] || 'Perusahaan',
          email: email,
          role: userRole,
        };

        setUser(userObj);
        useAppStore.getState().setUser(userObj);
        toast.success('Akun perusahaan berhasil diverifikasi! Selamat datang.');
        router.push('/dashboard');
      } else {
        toast.success('Verifikasi berhasil! Silakan masuk dengan kata sandi Anda.');
        setMode('login');
      }
    } catch (err: any) {
      setOtpError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    setOtpError('');

    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('Kode OTP baru telah dikirimkan ke email perusahaan Anda.');
      setCountdown(60);
    } catch (err: any) {
      setOtpError(parseErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  // 3. Handle Forgot Password - Step 1: Send OTP
  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setResetError('Masukkan alamat email perusahaan yang valid.');
      return;
    }

    setIsLoading(true);
    setResetError('');

    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Kode OTP reset password telah dikirim ke email perusahaan Anda.');
      setMode('forgot_otp');
      setResetOtpCode('');
    } catch (err: any) {
      setResetError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Forgot Password - Step 2: Verify Reset OTP
  const handleVerifyResetOtp = async (code: string) => {
    setResetError('');
    setIsLoading(true);

    try {
      await api.post('/auth/verify-reset-otp', {
        email,
        otp_code: code
      });
      setResetOtpCode(code);
      setMode('forgot_new_password');
    } catch (err: any) {
      setResetError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendResetOtp = async () => {
    setResetError('');
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Kode OTP reset baru telah dikirimkan ke email perusahaan Anda.');
    } catch (err: any) {
      setResetError(parseErrorMessage(err));
    }
  };

  // 5. Handle Forgot Password - Step 3: Set New Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNewPassword) {
      setResetError('Password baru belum memenuhi semua persyaratan keamanan.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Konfirmasi password tidak cocok. Silakan periksa kembali.');
      return;
    }

    setIsLoading(true);
    setResetError('');

    try {
      await api.post('/auth/reset-password', {
        email,
        otp_code: resetOtpCode,
        new_password: newPassword
      });

      toast.success('Password perusahaan berhasil diperbarui! Silakan masuk dengan password baru Anda.');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setResetOtpCode('');
      setMode('login');
    } catch (err: any) {
      setResetError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-900 dark:text-white">
      {/* Top Simple Header */}
      <header className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/Logo Ai Recruit Pro..png"
            alt="AI-RecruitPro Logo"
            width={70}
            height={70}
            className="h-13 sm:h-15 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
            priority
          />
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white leading-none">
            AI-RecruitPro
          </span>
        </Link>

        <Link
          href="/applicant/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-[#1A4B9F] dark:hover:text-blue-400 hover:border-[#1A4B9F]/40 shadow-xs text-xs font-semibold transition-all group"
        >
          <User size={15} className="text-[#1A4B9F] dark:text-blue-400" />
          <span>Portal Pelamar Kerja</span>
          <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-8 flex items-center justify-center">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">

          {/* 1. VIEW: LOGIN PERUSAHAAN */}
          {mode === 'login' && (
            <>
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1A4B9F]/10 dark:bg-slate-800 border border-[#1A4B9F]/20 dark:border-slate-700 flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 mx-auto">
                  <Building2 size={24} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t.employerAuth.loginTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {t.employerAuth.loginSubtitle}
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Perusahaan */}
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
                      placeholder={t.employerAuth.emailPlaceholder || "nama@perusahaan.com"}
                      className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 rounded-2xl text-sm outline-none transition-all ${
                        error ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block pt-0.5 font-medium">
                    {t.employerAuth.emailHelp || 'Gunakan alamat email resmi perusahaan Anda.'}
                  </span>
                </div>

                {/* Password Input with Eye Icon Toggle & Functional Forgot Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <label htmlFor="company-password">{t.employerAuth.passwordLabel}</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_email');
                        setError('');
                        setResetError('');
                      }}
                      className="text-[#1A4B9F] dark:text-blue-400 hover:underline text-[11px] font-bold cursor-pointer"
                    >
                      {t.employerAuth.forgotPassword}
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                    <input
                      id="company-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          document.getElementById('submit-btn')?.click();
                        }
                      }}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer p-1"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>

                {/* Error Notification */}
                {error && (
                  <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-start gap-3 leading-relaxed ${
                    error.toLowerCase().includes('ban') ||
                    error.toLowerCase().includes('blokir') ||
                    error.toLowerCase().includes('dinonaktifkan') ||
                    error.toLowerCase().includes('nonaktif') ||
                    error.toLowerCase().includes('non-aktif') ||
                    error.toLowerCase().includes('suspended') ||
                    error.toLowerCase().includes('ditangguhkan')
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                      : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300'
                  }`}>
                    {error.toLowerCase().includes('ban') ||
                    error.toLowerCase().includes('blokir') ||
                    error.toLowerCase().includes('dinonaktifkan') ||
                    error.toLowerCase().includes('nonaktif') ||
                    error.toLowerCase().includes('non-aktif') ||
                    error.toLowerCase().includes('suspended') ||
                    error.toLowerCase().includes('ditangguhkan') ? (
                      <ShieldBan size={20} className="shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                    ) : (
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    )}
                    <p className="leading-relaxed font-semibold text-xs mt-0.5">{error}</p>
                  </div>
                )}

                <button
                  id="submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white font-semibold text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <span>{t.employerAuth.processing}</span>
                  ) : (
                    <span>Masuk</span>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-3">
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {t.employerAuth.noAccount}{' '}
                  <Link href="/register" className="font-semibold text-[#1A4B9F] dark:text-blue-400 hover:underline block sm:inline mt-1 sm:mt-0">
                    {t.employerAuth.registerNow}
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* 2. VIEW: UNVERIFIED COMPANY OTP SCREEN */}
          {mode === 'unverified_otp' && (
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
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e, 'company-otp')}
                      onPaste={(e) => handleOtpPaste(e, 'company-otp')}
                      onFocus={(e) => e.target.select()}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all"
                    />
                  ))}
                </div>

                {otpError && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-start gap-2.5 leading-relaxed text-left">
                    <AlertCircle size={18} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <span className="flex-1">{otpError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <span>Memverifikasi...</span>
                  ) : (
                    <span>Verifikasi &amp; Masuk Dashboard</span>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
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

          {/* 3. VIEW: FORGOT PASSWORD - STEP 1 (ENTER COMPANY EMAIL) */}
          {mode === 'forgot_email' && (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1A4B9F]/10 dark:bg-slate-800 border border-[#1A4B9F]/20 dark:border-slate-700 flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 mx-auto">
                  <KeyRound size={24} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Lupa Password Perusahaan?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Masukkan email resmi perusahaan terdaftar. Kami akan mengirimkan 6-digit kode OTP untuk mereset password Anda.
                </p>
              </div>

              <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setResetError(''); }}
                      placeholder="nama@perusahaan.com"
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {resetError && (
                  <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2.5 leading-relaxed">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{resetError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <span>Mengirim OTP...</span>
                  ) : (
                    <>
                      <span>Kirim Kode OTP Reset</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setResetError(''); }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Login Perusahaan</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. VIEW: FORGOT PASSWORD - STEP 2 (VERIFY RESET OTP) */}
          {mode === 'forgot_otp' && (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="space-y-2 text-center">
                <div className="w-14 h-14 bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-2xl flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 mx-auto">
                  <KeyRound size={28} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Verifikasi OTP Reset Password</h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Masukkan 6 digit kode OTP yang telah dikirim ke email perusahaan: <strong className="text-[#1A4B9F] dark:text-blue-400 block break-all">{email}</strong>
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex justify-center items-center gap-2 sm:gap-3">
                  {Array(6).fill('').map((_, idx) => (
                    <input
                      key={idx}
                      id={`reset-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(-1);
                        e.target.value = val;
                        const inputs = document.querySelectorAll<HTMLInputElement>('[id^="reset-otp-"]');
                        if (val && idx < 5) {
                          inputs[idx + 1]?.focus();
                        }
                        const currentCode = Array.from(inputs).map(inp => inp.value).join('');
                        if (currentCode.length === 6) {
                          handleVerifyResetOtp(currentCode);
                        }
                      }}
                      onKeyDown={(e) => {
                        const inputs = document.querySelectorAll<HTMLInputElement>('[id^="reset-otp-"]');
                        if (e.key === 'Backspace') {
                          e.preventDefault();
                          if ((e.target as HTMLInputElement).value) {
                            (e.target as HTMLInputElement).value = '';
                            if (idx > 0) inputs[idx - 1]?.focus();
                          } else if (idx > 0) {
                            inputs[idx - 1].value = '';
                            inputs[idx - 1]?.focus();
                          }
                        } else if (e.key === 'ArrowLeft' && idx > 0) {
                          inputs[idx - 1]?.focus();
                        } else if (e.key === 'ArrowRight' && idx < 5) {
                          inputs[idx + 1]?.focus();
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all"
                    />
                  ))}
                </div>

                {resetError && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold text-center">
                    {resetError}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_email'); setResetError(''); }}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Ubah Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendResetOtp}
                    className="font-bold text-[#1A4B9F] dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Kirim Ulang OTP
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. VIEW: FORGOT PASSWORD - STEP 3 (ENTER NEW PASSWORD) */}
          {mode === 'forgot_new_password' && (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                  <ShieldCheck size={24} />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Atur Password Baru Perusahaan
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Silakan buat password baru yang kuat untuk akun <span className="font-semibold text-slate-900 dark:text-white">{email}</span>.
                </p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                {/* Password Baru */}
                <div className="space-y-1">
                  <label htmlFor="company-new-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password Baru Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                    <input
                      id="company-new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setResetError(''); }}
                      placeholder="Minimal 8 Karakter"
                      className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] focus:ring-2 focus:ring-blue-100 rounded-2xl text-sm outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer p-1"
                    >
                      {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1.5 mt-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Syarat Password:</span>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <div className={`flex items-center gap-1.5 font-medium ${strength.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {strength.length ? <Check size={12} /> : <X size={12} />}
                        <span>Min. 8 Karakter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-medium ${strength.uppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {strength.uppercase ? <Check size={12} /> : <X size={12} />}
                        <span>Huruf Besar (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-medium ${strength.lowercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {strength.lowercase ? <Check size={12} /> : <X size={12} />}
                        <span>Huruf Kecil (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-1.5 font-medium ${strength.number ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {strength.number ? <Check size={12} /> : <X size={12} />}
                        <span>Angka (0-9)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Konfirmasi Password */}
                <div className="space-y-1">
                  <label htmlFor="company-confirm-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Konfirmasi Password Baru <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                    <input
                      id="company-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setResetError(''); }}
                      placeholder="Ketik Ulang Password Baru"
                      className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] focus:ring-2 focus:ring-blue-100 rounded-2xl text-sm outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer p-1"
                    >
                      {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>

                {resetError && (
                  <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2.5 leading-relaxed">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{resetError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !isValidNewPassword || newPassword !== confirmPassword}
                  className="w-full py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isLoading ? 'Menyimpan...' : 'Simpan Password Baru Perusahaan'}</span>
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      <Footer />

    </div>
  );
}
