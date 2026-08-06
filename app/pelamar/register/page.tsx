'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import {
  HelpCircle,
  ArrowRight,
  Building2,
  Sparkles,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  KeyRound
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Temporary auth token from backend
  const [tempToken, setTempToken] = useState('');
  const [tempUserId, setTempUserId] = useState('');

  // OTP State
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
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
      setError(parseErrorMessage(err));
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
      const nextInput = document.getElementById(`pelamar-otp-${index + 1}`);
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
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('user_role', res.role || 'pelamar');
        localStorage.setItem('user_id', res.user_id || '');
      }
      localStorage.setItem('user_email', email);
      localStorage.setItem('isPelamarLoggedIn', 'true');

      // Redirect to pelamar dashboard
      router.push('/pelamar/dashboard');
    } catch (err: any) {
      setOtpError(parseErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
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

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#C2E5EF] dark:border-slate-800 space-y-7 relative animate-in fade-in duration-200">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-[#E0F1F7] dark:bg-slate-800 text-[#1b7b9e] dark:text-cyan-400 rounded-full text-[11px] font-extrabold border border-[#B8E1ED] dark:border-slate-700 inline-block">
                Langkah 1 dari 2: Pendaftaran Akun Pelamar
              </span>
              <h1 className="text-3xl font-black text-[#1b7b9e] dark:text-cyan-400">{t.pelamar.auth.registerTitle}</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {t.pelamar.auth.registerSubtitle}
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <label htmlFor="email">{t.pelamar.auth.emailLabel}</label>
                  <button type="button" className="text-[#1b7b9e] dark:text-cyan-400 hover:underline flex items-center gap-1">
                    <HelpCircle size={14} /> Bantuan
                  </button>
                </div>

                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="nama@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900 rounded-2xl text-sm outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi (Minimal 6 karakter)
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900 rounded-2xl text-sm outline-none transition-all dark:text-white"
                  />
                </div>
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
                className="w-full py-3.5 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLoading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang & Kirim OTP'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
              {t.pelamar.auth.hasAccount}{' '}
              <Link href="/pelamar/login" className="font-extrabold text-[#1b7b9e] dark:text-cyan-400 hover:underline">
                {t.pelamar.auth.loginNow}
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: OTP Verification Popup/Card */}
        {step === 2 && (
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#C2E5EF] dark:border-slate-800 space-y-7 relative animate-in zoom-in-95 duration-200">
            <div className="space-y-2 text-center">
              <div className="w-14 h-14 bg-[#E0F1F7] dark:bg-slate-800 border border-[#B8E1ED] dark:border-slate-700 rounded-2xl flex items-center justify-center text-[#2596be] dark:text-cyan-400 mx-auto">
                <KeyRound size={28} />
              </div>
              <h2 className="text-2xl font-black text-[#1b7b9e] dark:text-cyan-400">Verifikasi Kode OTP Email</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Kode verifikasi OTP 6-digit telah dikirimkan ke alamat email Anda: <strong className="text-[#2596be] dark:text-cyan-400">{email}</strong>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">

              {/* 6 Digit Inputs */}
              <div className="flex justify-center items-center gap-2 sm:gap-3">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`pelamar-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black text-[#1b7b9e] dark:text-cyan-400 bg-[#F0F8FB] dark:bg-slate-800 border-2 border-[#C2E5EF] dark:border-slate-700 focus:border-[#1b7b9e] dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all"
                  />
                ))}
              </div>

              {otpError && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold text-center">
                  {otpError}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  &larr; Ubah Email
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
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
              </div>

            </form>
          </div>
        )}

      </main>

      {/* Simple Footer */}
      <footer className="py-6 border-t border-[#C4E3ED] dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} AI-Recruit Pro Candidate Portal. Seluruh hak cipta dilindungi.
      </footer>

    </div>
  );
}
