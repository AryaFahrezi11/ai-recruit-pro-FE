'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import Footer from '@/components/Footer';
import { toast } from 'react-hot-toast';
import {
  ArrowRight,
  Building2,
  KeyRound,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { api, parseErrorMessage } from '@/lib/api';
import OtpVerificationCard from '@/components/auth/OtpVerificationCard';

type LoginMode = 'login' | 'unverified_otp' | 'forgot_email' | 'forgot_otp' | 'forgot_new_password';

export default function PelamarLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();

  // Mode state
  const [mode, setMode] = useState<LoginMode>('login');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedConsent, setAgreedConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Unverified Account State
  const [unverifiedAlert, setUnverifiedAlert] = useState('');
  const [otpError, setOtpError] = useState('');

  // Forgot / Reset Password State
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState('');

  // Password requirements validator
  const checkPasswordStrength = (pwd: string) => {
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[@$!%*?&#^_\-]/.test(pwd),
    };
  };
  const strength = checkPasswordStrength(newPassword);
  const isValidNewPassword = Object.values(strength).every(Boolean);

  // 1. Handle Standard Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (!password) {
      setError('Masukkan password akun Anda.');
      return;
    }
    if (!agreedConsent) {
      setError('Anda harus menyetujui persetujuan pemrosesan dan penyimpanan data diri untuk melanjutkan masuk.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password, role: 'pelamar' });

      // Check email verification status in payload
      if (res.is_verified === false || res.is_email_verified === false) {
        setUnverifiedAlert(
          'Akun Anda belum aktif karena belum memasukkan kode OTP saat pendaftaran. Silakan masukkan kode OTP yang telah dikirimkan ke email Anda untuk mengaktifkan akun.'
        );
        setMode('unverified_otp');
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
        toast.success('Berhasil masuk! Mengalihkan ke dashboard...');
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
        parsed.toLowerCase().includes('belum aktif') ||
        parsed.toLowerCase().includes('verifikasi')
      ) {
        setUnverifiedAlert(
          'Perhatian: Anda mencoba masuk tetapi belum memverifikasi kode OTP saat pendaftaran. Silakan masukkan kode OTP di bawah untuk mengaktifkan akun dan langsung masuk ke dasbor.'
        );
        setMode('unverified_otp');
        setOtpError('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle OTP Verification for Unverified Account
  const handleVerifyUnverifiedOtp = async (code: string) => {
    setOtpError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', {
        email,
        otp_code: code
      });

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

  const handleResendUnverifiedOtp = async () => {
    setOtpError('');
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('Kode OTP baru berhasil dikirimkan ke email Anda.');
    } catch (err: any) {
      setOtpError(parseErrorMessage(err));
      throw err;
    }
  };

  // 3. Handle Forgot Password - Step 1: Send OTP
  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setResetError('Masukkan alamat email yang valid.');
      return;
    }

    setIsLoading(true);
    setResetError('');

    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Kode OTP reset password telah dikirim ke email Anda.');
      setMode('forgot_otp');
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
      toast.success('Kode OTP reset baru telah dikirimkan ke email Anda.');
    } catch (err: any) {
      setResetError(parseErrorMessage(err));
      throw err;
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

      toast.success('Password berhasil diperbarui! Silakan masuk dengan password baru Anda.');
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
              Masuk ke Akun Pelamar
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

        {/* 1. VIEW: STANDARD LOGIN */}
        {mode === 'login' && (
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-7 relative animate-in fade-in duration-200">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.pelamar.auth.loginTitle}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t.pelamar.auth.loginSubtitle}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.pelamar.auth.emailLabel}
                </label>
                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder={t.pelamar.auth.emailPlaceholder}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <label htmlFor="password">
                    {t.pelamar.auth.passwordLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_email');
                      setError('');
                      setResetError('');
                    }}
                    className="text-[#1A4B9F] dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                  >
                    {t.pelamar.auth.forgotPassword || 'Lupa password?'}
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              {/* Checkbox Persetujuan Pemrosesan & Penyimpanan Data Diri */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  id="login-consent"
                  type="checkbox"
                  checked={agreedConsent}
                  onChange={(e) => {
                    setAgreedConsent(e.target.checked);
                    if (e.target.checked && error.includes('persetujuan')) setError('');
                  }}
                  className="mt-1 w-4 h-4 text-[#1A4B9F] rounded border-slate-300 dark:border-slate-700 focus:ring-[#1A4B9F] dark:focus:ring-blue-400 cursor-pointer shrink-0"
                />
                <label htmlFor="login-consent" className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                  Saya menyetujui pemrosesan dan penyimpanan data diri (seperti biodata, riwayat pendidikan, pengalaman kerja, dan berkas CV) untuk keperluan melengkapi CV dan lamaran pekerjaan di platform AI-RecruitPro.
                </label>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
          </div>
        )}

        {/* 2. VIEW: UNVERIFIED ACCOUNT OTP (EXACT SAME AS REGISTRATION OTP VIEW + ALERT) */}
        {mode === 'unverified_otp' && (
          <OtpVerificationCard
            email={email}
            title="Verifikasi Akun Pelamar"
            subtitle="Masukkan 6-digit kode OTP pendaftaran yang dikirim ke"
            alertNotice={unverifiedAlert}
            onVerify={handleVerifyUnverifiedOtp}
            onResend={handleResendUnverifiedOtp}
            onBack={() => { setMode('login'); setError(''); }}
            backButtonText="(Kembali ke Login)"
            isLoading={isLoading}
            error={otpError}
            buttonText="Verifikasi & Masuk Dashboard"
            inputPrefix="login-unverified-otp"
          />
        )}

        {/* 3. VIEW: FORGOT PASSWORD - STEP 1 (ENTER EMAIL) */}
        {mode === 'forgot_email' && (
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-7 relative animate-in zoom-in-95 duration-200">
            <div className="space-y-3 text-center">
              <div className="mx-auto w-14 h-14 bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900/80 rounded-2xl flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 shadow-sm">
                <KeyRound size={26} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lupa Password?</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Masukkan email akun Anda. Kami akan mengirimkan 6-digit kode OTP untuk mereset kata sandi.
              </p>
            </div>

            <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.pelamar.auth.emailLabel}
                </label>
                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setResetError(''); }}
                    placeholder={t.pelamar.auth.emailPlaceholder}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {resetError && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3.5 rounded-full bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'Mengirim OTP...' : 'Kirim Kode OTP Reset'}</span>
                {!isLoading && <ArrowRight size={18} />}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setResetError(''); }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Kembali ke Halaman Login</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. VIEW: FORGOT PASSWORD - STEP 2 (VERIFY RESET OTP) */}
        {mode === 'forgot_otp' && (
          <OtpVerificationCard
            email={email}
            title="Verifikasi OTP Reset"
            subtitle="Masukkan 6-digit kode OTP reset password yang dikirim ke"
            onVerify={handleVerifyResetOtp}
            onResend={handleResendResetOtp}
            onBack={() => { setMode('forgot_email'); setResetError(''); }}
            backButtonText="(Ubah Email)"
            isLoading={isLoading}
            error={resetError}
            buttonText="Lanjut Buat Password Baru"
            inputPrefix="forgot-otp"
          />
        )}

        {/* 5. VIEW: FORGOT PASSWORD - STEP 3 (ENTER NEW PASSWORD) */}
        {mode === 'forgot_new_password' && (
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 relative animate-in zoom-in-95 duration-200">
            <div className="space-y-3 text-center">
              <div className="mx-auto w-14 h-14 bg-green-50 dark:bg-green-950/80 border border-green-100 dark:border-green-900/80 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm">
                <ShieldCheck size={26} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Atur Password Baru</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Silakan buat password baru yang kuat dan aman untuk akun <span className="font-semibold text-slate-900 dark:text-white">{email}</span>.
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              {/* Password Baru */}
              <div className="space-y-1">
                <label htmlFor="new-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setResetError(''); }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    {t.pelamar.auth.passwordRequirements}
                  </p>
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

              {/* Konfirmasi Password */}
              <div className="space-y-1">
                <label htmlFor="confirm-new-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Konfirmasi Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <KeyRound size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setResetError(''); }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              {resetError && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !isValidNewPassword || newPassword !== confirmPassword}
                className="w-full py-3.5 rounded-full bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}</span>
                {!isLoading && <ArrowRight size={18} />}
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setResetError(''); }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Batal dan Kembali ke Login</span>
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
