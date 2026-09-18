'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import {
  GraduationCap,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Check,
  ArrowLeft
} from 'lucide-react';
import { api, parseErrorMessage } from '@/lib/api';
import OtpVerificationCard from '@/components/auth/OtpVerificationCard';
import { isCampusEmail } from '../login/page';

export default function CampusRegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();

  // Wizard step: 1 = Register form, 2 = OTP Verification
  const [step, setStep] = useState<number>(1);

  // Form State
  const [namaKampus, setNamaKampus] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedConsent, setAgreedConsent] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const handleCheckEmail = async () => {
    if (!email || !email.includes('@')) return;
    setIsCheckingEmail(true);
    try {
      const res = await api.get(`/auth/check-email?email=${encodeURIComponent(email.trim())}&role=kampus`);
      if (res.exists && res.is_active && (res.role === 'kampus' || !res.role)) {
        setError('Alamat email ini sudah terdaftar sebagai akun universitas yang aktif. Silakan langsung masuk ke akun Anda.');
      } else if (error.toLowerCase().includes('terdaftar')) {
        setError('');
      }
    } catch {
      // ignore network errors on passive check
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // OTP State
  const [otpError, setOtpError] = useState('');

  // Password Strength Validator
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

  // Handle Form Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    const cleanNamaKampus = namaKampus.trim();

    if (!cleanNamaKampus) {
      setError('Masukkan nama resmi universitas / institusi Anda.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Masukkan alamat email resmi universitas yang valid.');
      return;
    }

    // MANDATORY CAMPUS EMAIL VALIDATION
    if (!isCampusEmail(cleanEmail)) {
      setError(
        'Pendaftaran akun universitas wajib menggunakan email resmi institusi universitas (contoh domain: .ac.id atau .edu). Email publik seperti @gmail.com atau @yahoo.com tidak dapat dipergunakan.'
      );
      return;
    }

    if (!isValidPassword) {
      setError('Password belum memenuhi semua persyaratan keamanan di bawah.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok. Silakan periksa kembali.');
      return;
    }

    if (!agreedConsent) {
      setError('Anda harus menyetujui persetujuan pemrosesan dan penyimpanan data untuk melanjutkan pendaftaran.');
      return;
    }

    setIsLoading(true);

    try {
      // Send register request to auth endpoint with role = 'kampus'
      await api.post('/auth/register', {
        email: cleanEmail,
        password,
        role: 'kampus',
        nama_perusahaan: cleanNamaKampus, // Backend uses company/institution name parameter
        nama_kampus: cleanNamaKampus,
      });

      toast.success('Pendaftaran akun universitas berhasil! Silakan periksa kode OTP di email Anda.');
      setStep(2);
    } catch (err: any) {
      const parsed = parseErrorMessage(err);
      setError(parsed);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Verification Submit
  const handleVerifyOtp = async (otpCode: string) => {
    setOtpError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', {
        email: email.trim(),
        otp_code: otpCode,
      });

      const token = res.access_token || res.data?.access_token;
      const role = res.role || res.data?.role || 'kampus';
      const userId = res.user_id || res.data?.user_id || '';

      if (token) {
        localStorage.removeItem('campus_profile_completed');
        localStorage.removeItem(`campus_profile_completed_${email.trim()}`);
        localStorage.setItem('access_token', token);
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_id', userId);
        localStorage.setItem('user_email', email.trim());
        localStorage.setItem('isCampusLoggedIn', 'true');
        toast.success('Verifikasi akun universitas berhasil! Silakan lengkapi profil kampus Anda...');
        router.push('/campus/dashboard');
      } else {
        toast.success('Verifikasi akun universitas berhasil! Silakan login ke akun Anda.');
        router.push('/campus/login');
      }
    } catch (err: any) {
      setOtpError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    try {
      await api.post('/auth/resend-otp', { email: email.trim() });
      toast.success('Kode OTP baru berhasil dikirim ulang ke email kampus Anda.');
    } catch (err: any) {
      toast.error(parseErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-900 dark:text-white">
      {/* Top Simple Header */}
      <header className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-5 flex items-center justify-between">
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
          href="/campus/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-[#1A4B9F] dark:hover:text-blue-400 hover:border-[#1A4B9F]/40 shadow-xs text-xs font-semibold transition-all group"
        >
          <GraduationCap size={15} className="text-[#1A4B9F] dark:text-blue-400" />
          <span>Masuk ke Akun Universitas</span>
          <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-8 flex items-center justify-center">
        {step === 2 ? (
          /* STEP 2: OTP VERIFICATION CARD */
          <OtpVerificationCard
            email={email}
            title="Verifikasi OTP Email Universitas"
            subtitle="Kode verifikasi 6-digit telah dikirimkan ke"
            alertNotice={
              <span>
                Masukkan kode OTP dari email resmi <strong className="font-bold text-slate-900 dark:text-white">{email}</strong> untuk menyelesaikan pendaftaran akun universitas.
              </span>
            }
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            onBack={() => setStep(1)}
            backButtonText="(Ubah Data)"
            isLoading={isLoading}
            error={otpError}
          />
        ) : (
          /* STEP 1: REGISTRATION FORM */
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
            
            {/* Header Badge */}
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1A4B9F]/10 dark:bg-slate-800 border border-[#1A4B9F]/20 dark:border-slate-700 flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 mx-auto">
                <GraduationCap size={24} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">
                Daftar Akun Universitas
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

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {/* Nama Universitas */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Universitas / Institusi
                </label>
                <div className="relative flex items-center">
                  <Building2 size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={namaKampus}
                    onChange={(e) => {
                      setNamaKampus(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="contoh: Universitas Indonesia"
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email Universitas */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Resmi Universitas (.ac.id / .edu)
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
                    onBlur={handleCheckEmail}
                    placeholder="contoh: cdc@institusi.ac.id"
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all font-mono"
                    required
                  />
                </div>
                {isCheckingEmail && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 pl-1">
                    Memeriksa ketersediaan email...
                  </p>
                )}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Gunakan email resmi domain universitas/institusi Anda (.ac.id / .edu). Email pribadi (Gmail, Yahoo) tidak diperbolehkan.
                </p>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Buat password akun universitas"
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

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Konfirmasi Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Ulangi password"
                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="consent-check"
                  checked={agreedConsent}
                  onChange={(e) => setAgreedConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#1A4B9F] focus:ring-[#1A4B9F] cursor-pointer"
                />
                <label htmlFor="consent-check" className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                  Saya menyetujui pemrosesan data institusi kampus & verifikasi email resmi untuk kebutuhan integrasi AI-RecruitPro.
                </label>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading || !agreedConsent}
                className="w-full py-3.5 rounded-full bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{isLoading ? 'Memproses Pendaftaran...' : 'Daftar & Kirim Kode Verifikasi'}</span>
              </button>
            </form>

            {/* Footer Login Link */}
            <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
              Sudah memiliki akun universitas resmi?{' '}
              <Link href="/campus/login" className="font-semibold text-[#1A4B9F] dark:text-blue-400 hover:underline">
                Masuk ke Akun Universitas
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
