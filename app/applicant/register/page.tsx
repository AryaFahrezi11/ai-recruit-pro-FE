'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

import {
  HelpCircle,
  Building2,
  Sparkles,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Edit3,
  RefreshCw,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { api, parseErrorMessage } from '@/lib/api';

export default function PelamarRegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();

  // Wizard state: step 1 (Register form), step 2 (OTP Popup/Screen)
  const [step, setStep] = useState<number>(1);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Temporary auth token from backend
  const [tempToken, setTempToken] = useState('');
  const [tempUserId, setTempUserId] = useState('');

  // OTP State
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

  const checkPasswordStrength = (pwd: string) => {
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[@$!%*?&#^_\-]/.test(pwd),
    };
  };
  const strength = checkPasswordStrength(password);
  const isValidPassword = Object.values(strength).every(Boolean);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (!isValidPassword) {
      setError('Password belum memenuhi semua persyaratan di bawah.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok. Silakan periksa kembali.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', {
        email,
        password,
        role: 'pelamar'
      });

      if (res.access_token) {
        setTempToken(res.access_token);
        setTempUserId(res.user_id || '');
      }

      // Move to OTP Step
      setStep(2);
    } catch (err: any) {
      const errMsg = parseErrorMessage(err);
      if (errMsg.toLowerCase().includes('terdaftar') || errMsg.toLowerCase().includes('already') || errMsg.toLowerCase().includes('exist')) {
        setError('');
        setStep(2);
        return;
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue && value !== '') return;

    const newOtp = [...otpCode];
    newOtp[index] = cleanValue.slice(-1);
    setOtpCode(newOtp);

    // Auto focus next input
    if (cleanValue && index < 5) {
      const nextInput = document.getElementById(`pelamar-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`pelamar-otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newOtp = [...otpCode];
        newOtp[index - 1] = '';
        setOtpCode(newOtp);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = ['', '', '', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtpCode(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      const targetInput = document.getElementById(`pelamar-otp-${focusIndex}`);
      if (targetInput) targetInput.focus();
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

      // Clear any previous session's CV data for clean initial registration
      localStorage.removeItem('candidateCvData');
      localStorage.removeItem('candidateCvCreated');

      if (res.access_token) {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('user_role', res.role || 'pelamar');
        localStorage.setItem('user_id', res.user_id || '');
      }
      localStorage.setItem('user_email', email);
      localStorage.setItem('isPelamarLoggedIn', 'true');

      // Redirect to pelamar dashboard
      router.push('/applicant/dashboard');
    } catch (err: any) {
      setOtpError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
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
              Daftar Akun Pelamar
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

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-7 relative animate-in fade-in duration-200">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.pelamar.auth.registerTitle}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t.pelamar.auth.registerSubtitle}
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <label htmlFor="email">{t.pelamar.auth.emailLabel}</label>
                  <button type="button" className="text-[#1A4B9F] dark:text-blue-400 hover:underline flex items-center gap-1">
                    <HelpCircle size={14} /> {t.pelamar.auth.help}
                  </button>
                </div>

                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('password')?.focus();
                      }
                    }}
                    placeholder={t.pelamar.auth.emailPlaceholder}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.pelamar.auth.passwordLabel} <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('confirmPassword')?.focus();
                      }
                    }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
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
                
                {/* Password Strength Indicator */}
                <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-2">{t.pelamar.auth.passwordRequirements}</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className={`flex items-center gap-1.5 ${strength.length ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {strength.length ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                      {t.pelamar.auth.min8Chars}
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.uppercase ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {strength.uppercase ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                      {t.pelamar.auth.uppercase}
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.lowercase ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {strength.lowercase ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                      {t.pelamar.auth.lowercase}
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.number ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {strength.number ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                      {t.pelamar.auth.number}
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.special ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {strength.special ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                      {t.pelamar.auth.specialChar}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1 mt-4">
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <KeyRound size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('submit-btn')?.click();
                      }
                    }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                id="submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-semibold text-sm shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? t.pelamar.auth.processing : t.pelamar.auth.signUp}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
              {t.pelamar.auth.hasAccount}{' '}
              <Link href="/applicant/login" className="font-semibold text-[#1A4B9F] dark:text-blue-400 hover:underline">
                {t.pelamar.auth.loginNow}
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: Ultra Clean Enterprise Email Verification */}
        {step === 2 && (
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-7 animate-in zoom-in-95 duration-200 mx-auto text-center">
            
            {/* Clean Mail Icon Badge */}
            <div className="mx-auto w-14 h-14 bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900/80 rounded-2xl flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 shadow-sm">
              <Mail size={26} />
            </div>

            {/* Header & Email */}
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Verifikasi Email
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                Masukkan 6-digit kode OTP yang dikirim ke{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{email}</span>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtpError(''); }}
                  className="text-[#1A4B9F] dark:text-blue-400 hover:underline font-semibold text-xs ml-1"
                >
                  (Ubah)
                </button>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* 3 x 3 Split OTP Inputs */}
              <div className="flex justify-center items-center gap-2">
                <div className="flex gap-1.5 sm:gap-2">
                  {otpCode.slice(0, 3).map((digit, idx) => (
                    <input
                      key={idx}
                      id={`pelamar-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-all shadow-sm"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
                <span className="text-slate-300 dark:text-slate-700 font-light text-xl select-none px-0.5">—</span>
                <div className="flex gap-1.5 sm:gap-2">
                  {otpCode.slice(3, 6).map((digit, idx) => {
                    const realIdx = idx + 3;
                    return (
                      <input
                        key={realIdx}
                        id={`pelamar-otp-${realIdx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(realIdx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(realIdx, e)}
                        onPaste={handleOtpPaste}
                        className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-all shadow-sm"
                      />
                    );
                  })}
                </div>
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-medium text-center">
                  {otpError}
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isLoading || otpCode.join('').length < 6}
                className="w-full py-3.5 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? 'Memverifikasi...' : 'Verifikasi Email'}
              </button>

              <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending || countdown > 0}
                  className="text-xs font-semibold text-[#1A4B9F] dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                >
                  {countdown > 0 ? `Kirim ulang kode OTP dalam (${countdown}s)` : isResending ? 'Mengirim ulang...' : 'Belum menerima kode? Kirim Ulang OTP'}
                </button>
              </div>

            </form>
          </div>
        )}

      </main>

      <Footer />

    </div>
  );
}
