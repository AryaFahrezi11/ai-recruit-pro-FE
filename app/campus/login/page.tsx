'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import Footer from '@/components/Footer';
import { toast } from 'react-hot-toast';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  Building2,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  User
} from 'lucide-react';
import { api, parseErrorMessage } from '@/lib/api';
import OtpVerificationCard from '@/components/auth/OtpVerificationCard';

type LoginMode = 'login' | 'unverified_otp' | 'forgot_email' | 'forgot_otp' | 'forgot_new_password';

// Helper to validate official campus emails (.ac.id, .edu, .sch.id, etc.)
export function isCampusEmail(emailStr: string): boolean {
  if (!emailStr || !emailStr.includes('@')) return false;
  const domain = emailStr.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  
  return (
    domain.endsWith('.ac.id') ||
    domain.endsWith('.edu') ||
    domain.endsWith('.sch.id') ||
    domain.includes('university') ||
    domain.includes('kampus')
  );
}

export default function CampusLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();

  // Mode state
  const [mode, setMode] = useState<LoginMode>('login');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Unverified Account State
  const [unverifiedAlert, setUnverifiedAlert] = useState('');

  // Forgot / Reset Password State
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState('');

  // Password requirements validator for reset password
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

  // Handle Standard Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Masukkan alamat email resmi kampus yang valid.');
      return;
    }

    // MANDATORY CAMPUS EMAIL VALIDATION
    if (!isCampusEmail(cleanEmail)) {
      setError(
        'Login portal kampus wajib menggunakan akun email resmi kampus (contoh domain: .ac.id atau .edu). Email publik seperti @gmail.com atau @yahoo.com tidak dapat digunakan.'
      );
      return;
    }

    if (!password) {
      setError('Masukkan password akun universitas Anda.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: cleanEmail,
        password,
        role: 'kampus',
      });

      const data = res.data || res;

      // Check email verification status
      if (data.is_verified === false || data.is_email_verified === false) {
        setUnverifiedAlert(
          'Akun Universitas Anda belum aktif karena belum memverifikasi kode OTP saat pendaftaran. Silakan masukkan kode OTP yang telah dikirimkan ke email universitas Anda.'
        );
        setMode('unverified_otp');
        setIsLoading(false);
        return;
      }

      const token = data.access_token;
      const role = data.role || 'kampus';
      const userId = data.user_id;

      if (token) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_id', userId || '');
        localStorage.setItem('user_email', cleanEmail);
        localStorage.setItem('isCampusLoggedIn', 'true');
        toast.success('Berhasil masuk! Mengalihkan ke Dasbor Universitas...');
        router.push('/campus/dashboard');
      } else {
        setError('Respon login dari server tidak valid.');
      }
    } catch (err: any) {
      const parsed = parseErrorMessage(err);

      const lowerMsg = parsed.toLowerCase();
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
          lowerMsg.includes('perlu verifikasi') ||
          lowerMsg.includes('verifikasi kode') ||
          lowerMsg.includes('memasukkan kode') ||
          (lowerMsg.includes('verifikasi') && !lowerMsg.includes('dinonaktifkan')));

      if (isUnverified) {
        setUnverifiedAlert(parsed);
        setMode('unverified_otp');
        setError('');
        api.post('/auth/resend-otp', { email: cleanEmail }).catch(() => {});
        return;
      }

      // Check if email is registered in DB to differentiate unregistered account vs wrong password
      try {
        const checkRes = await api.get(`/auth/check-email?email=${encodeURIComponent(cleanEmail)}&role=kampus`);
        if (checkRes && checkRes.exists === false) {
          setError('Akun Universitas belum terdaftar. Silakan daftarkan universitas Anda terlebih dahulu.');
          return;
        }
      } catch (_) {}

      const isUnregistered =
        err?.status === 404 ||
        lowerMsg.includes('not found') ||
        lowerMsg.includes('tidak terdaftar') ||
        lowerMsg.includes('belum terdaftar') ||
        lowerMsg.includes('tidak ditemukan') ||
        lowerMsg.includes('unregistered') ||
        lowerMsg.includes('no user') ||
        lowerMsg.includes('user not found') ||
        lowerMsg.includes('account not found');

      if (isUnregistered) {
        setError('Akun Universitas belum terdaftar. Silakan daftarkan universitas Anda terlebih dahulu.');
      } else {
        setError(parsed);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Verification for Unverified Account
  const handleVerifyOtpUnverified = async (otp: string) => {
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', {
        email: email.trim(),
        otp_code: otp,
      });

      const token = res.access_token || res.data?.access_token;
      const role = res.role || res.data?.role || 'kampus';

      if (token) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_email', email.trim());
        localStorage.setItem('isCampusLoggedIn', 'true');
        toast.success('Verifikasi email kampus berhasil! Selamat datang.');
        router.push('/campus/dashboard');
      } else {
        toast.success('Verifikasi email berhasil! Silakan masuk kembali.');
        setMode('login');
      }
    } catch (err: any) {
      setError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    try {
      await api.post('/auth/resend-otp', { email: email.trim() });
      toast.success('Kode OTP baru berhasil dikirim ke email kampus Anda.');
    } catch (err: any) {
      toast.error(parseErrorMessage(err));
    }
  };

  // Forgot Password: Request OTP
  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setResetError('Masukkan email kampus yang terdaftar.');
      return;
    }

    if (!isCampusEmail(cleanEmail)) {
      setResetError('Alamat email harus menggunakan domain resmi kampus (.ac.id / .edu).');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: cleanEmail });
      toast.success('Kode OTP reset password telah dikirim ke email Anda.');
      setMode('forgot_otp');
    } catch (err: any) {
      setResetError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password: Verify OTP & Submit New Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!resetOtpCode || resetOtpCode.length < 6) {
      setResetError('Masukkan 6-digit kode OTP reset password.');
      return;
    }
    if (!isValidNewPassword) {
      setResetError('Password baru belum memenuhi semua persyaratan keamanan.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: email.trim(),
        otp_code: resetOtpCode,
        new_password: newPassword,
      });

      toast.success('Password akun universitas berhasil diperbarui! Silakan login.');
      setMode('login');
      setPassword('');
      setResetOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setResetError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-900 dark:text-white">
      {/* Top Simple Header */}
      <header className="w-full max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-14 py-3.5 sm:py-5 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <Image
            src="/logo_hd.png"
            alt="AI-RecruitPro Logo"
            width={70}
            height={70}
            unoptimized
            className="h-7 sm:h-9 md:h-10 w-auto object-contain shrink-0 transition-transform group-hover:scale-105"
            priority
          />
          <span className="font-extrabold text-xs sm:text-sm md:text-base tracking-tight text-slate-900 dark:text-white leading-none">
            AI-RecruitPro
          </span>
        </Link>

        <Link
          href="/applicant/login"
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-[#1A4B9F] dark:hover:text-blue-400 hover:border-[#1A4B9F]/40 shadow-xs text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0 transition-all group"
        >
          <User size={14} className="text-[#1A4B9F] dark:text-blue-400 shrink-0" />
          <span>Akun Pelamar</span>
          <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
      </header>

      {/* Main Centered Login Card */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-8 flex items-center justify-center">
        {/* MODE: UNVERIFIED OTP */}
        {mode === 'unverified_otp' ? (
          <OtpVerificationCard
            email={email}
            title="Verifikasi Akun Universitas"
            subtitle="Kode OTP 6-digit telah dikirim ke email kampus"
            alertNotice={unverifiedAlert}
            onVerify={handleVerifyOtpUnverified}
            onResend={handleResendOtp}
            onBack={() => setMode('login')}
            backButtonText="(Ganti Email)"
            isLoading={isLoading}
            error={error}
          />
        ) : mode === 'forgot_email' ? (
          /* MODE: FORGOT PASSWORD - STEP 1 (EMAIL) */
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1A4B9F]/10 dark:bg-slate-800 border border-[#1A4B9F]/20 dark:border-slate-700 flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 mx-auto">
                <KeyRound size={24} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">
                Lupa Password Universitas
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Masukkan alamat email resmi kampus yang terdaftar untuk menerima kode OTP reset password.
              </p>
            </div>

            {resetError && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">{resetError}</p>
              </div>
            )}

            <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Resmi Kampus
                </label>
                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (resetError) setResetError('');
                    }}
                    placeholder="contoh: cdc@institusi.ac.id"
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{isLoading ? 'Sending OTP...' : 'Kirim Kode OTP Reset'}</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full py-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold"
              >
                Batal & Kembali ke Login
              </button>
            </form>
          </div>
        ) : mode === 'forgot_otp' || mode === 'forgot_new_password' ? (
          /* MODE: FORGOT PASSWORD - STEP 2 (OTP + NEW PASSWORD) */
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1A4B9F]/10 dark:bg-slate-800 border border-[#1A4B9F]/20 dark:border-slate-700 flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 mx-auto">
                <Lock size={24} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">
                Setel Password Baru
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Masukkan kode OTP 6-digit dari email <span className="font-semibold text-slate-900 dark:text-white">{email}</span> dan buat password baru.
              </p>
            </div>

            {resetError && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">{resetError}</p>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kode OTP (6-Digit)
                </label>
                <div className="relative flex items-center">
                  <KeyRound size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    maxLength={6}
                    value={resetOtpCode}
                    onChange={(e) => setResetOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Masukkan 6 angka OTP"
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all font-mono tracking-widest"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password Baru
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Buat password kuat"
                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-2">Persyaratan password:</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className={`flex items-center gap-1.5 ${strength.length ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {strength.length ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                      Minimal 8 karakter
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.uppercase ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {strength.uppercase ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                      Huruf kapital (A-Z)
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.lowercase ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {strength.lowercase ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                      Huruf kecil (a-z)
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.number ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {strength.number ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                      Angka (0-9)
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.special ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {strength.special ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                      Karakter khusus (!@#...)
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Konfirmasi Password Baru
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isValidNewPassword}
                className="w-full py-3.5 rounded-full bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{isLoading ? 'Updating...' : 'Simpan Password Baru'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* MODE: STANDARD CAMPUS LOGIN */
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            {/* Header Badge */}
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1A4B9F]/10 dark:bg-slate-800 border border-[#1A4B9F]/20 dark:border-slate-700 flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 mx-auto">
                <GraduationCap size={24} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">
                Masuk ke Akun Universitas
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Pantau karir alumni & mahasiswa
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Resmi Universitas
                </label>
                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="contoh: cdc@institusi.ac.id"
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <label htmlFor="campus-login-password">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot_email')}
                    className="text-[#1A4B9F] dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    id="campus-login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{isLoading ? 'Memproses...' : 'Masuk'}</span>
              </button>
            </form>

            {/* Switch to Register */}
            <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
              Belum mendaftarkan universitas Anda?{' '}
              <Link href="/campus/register" className="font-semibold text-[#1A4B9F] dark:text-blue-400 hover:underline">
                Daftarkan Universitas Anda
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
