'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApiUrl } from '@/lib/api';
import {
  Building2,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  FileText,
  Upload,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Edit3,
  RefreshCw,
  Info,
  ArrowLeft,
} from 'lucide-react';

function CompanyRegistrationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Multi-step state: 1 (Email & Pass), 2 (OTP), 3 (Legalitas Form), 4 (Pending)
  const [step, setStep] = useState<number>(1);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorStep1, setErrorStep1] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const checkPasswordStrength = (pwd: string) => ({
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /\d/.test(pwd),
    special: /[@$!%*?&#^_\-]/.test(pwd),
  });

  const strength = checkPasswordStrength(password);
  const isValidPassword = Object.values(strength).every(Boolean);

  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [errorStep2, setErrorStep2] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  React.useEffect(() => {
    let interval: any;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const [companyName, setCompanyName] = useState('');
  const [industri, setIndustri] = useState('');
  const [ukuran, setUkuran] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [nibNpwpNumber, setNibNpwpNumber] = useState('');
  const [nibFile, setNibFile] = useState<File | null>(null);
  const [companyAddress, setCompanyAddress] = useState('');

  const [hrFullName, setHrFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [hrPosition, setHrPosition] = useState('');
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [existingNibUrl, setExistingNibUrl] = useState<string | null>(null);
  const [existingIdCardUrl, setExistingIdCardUrl] = useState<string | null>(null);
  const [isFromIncomplete, setIsFromIncomplete] = useState(false);
  const [errorStep3, setErrorStep3] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect step=3 from URL query or incomplete login
  useEffect(() => {
    const stepQuery = searchParams.get('step');
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    if (stepQuery === '3' && token) {
      setStep(3);
      setIsFromIncomplete(true);

      // Pre-fill existing data from profile if available
      fetch(getApiUrl('/users/profile'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.profil) {
            const p = data.profil;
            if (p.nama_perusahaan) setCompanyName(p.nama_perusahaan);
            if (p.industri) setIndustri(p.industri);
            if (p.ukuran) setUkuran(p.ukuran);
            if (p.website_url) setWebsiteUrl(p.website_url);
            if (p.alamat) setCompanyAddress(p.alamat);
            if (p.nib_number) setNibNpwpNumber(p.nib_number);
            if (p.hr_name) setHrFullName(p.hr_name);
            if (p.hr_whatsapp) setWhatsappNumber(p.hr_whatsapp);
            if (p.hr_position) setHrPosition(p.hr_position);
            if (p.nib_document_url) setExistingNibUrl(p.nib_document_url);
            if (p.hr_id_card_url) setExistingIdCardUrl(p.hr_id_card_url);
          }
          if (data && data.email) {
            setEmail(data.email);
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  // List of blocked free email domains
  const freeEmailDomains = [
    'gmail.com', 'yahoo.com', 'yahoo.co.id', 'ymail.com',
    'hotmail.com', 'outlook.com', 'live.com', 'icloud.com',
    'aol.com', 'zoho.com', 'protonmail.com'
  ];

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) { setErrorStep1('Masukkan alamat email perusahaan yang valid.'); return; }
    const domain = email.split('@')[1]?.toLowerCase();
    const isAcId = domain?.endsWith('.ac.id') || domain === 'ac.id';
    if (freeEmailDomains.includes(domain) && !isAcId) {
      setErrorStep1('Pendaftaran Ditolak: Anda menggunakan email pribadi (Gmail/Yahoo). Harap gunakan email domain perusahaan resmi atau .ac.id untuk testing.');
      return;
    }

    if (!isValidPassword) {
      setErrorStep1('Kata sandi belum memenuhi semua persyaratan keamanan.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorStep1('Konfirmasi kata sandi tidak cocok dengan kata sandi.');
      return;
    }
    if (!isValidPassword) { setErrorStep1('Password belum memenuhi semua persyaratan di bawah.'); return; }
    if (password !== confirmPassword) { setErrorStep1('Konfirmasi password tidak cocok. Silakan periksa kembali.'); return; }

    setErrorStep1('');
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'perusahaan' })
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = typeof data.detail === 'string' ? data.detail : '';
        // Otomatis langsung arahkan ke Step 2 (Verifikasi OTP) tanpa perlu klik tombol lagi
        if (detail.toLowerCase().includes('terdaftar') || detail.toLowerCase().includes('already') || detail.toLowerCase().includes('exist')) {
          setIsLoading(false);
          setErrorStep1('');
          setStep(2);
          return;
        }
        setErrorStep1(detail || 'Terjadi kesalahan saat pendaftaran.');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      setStep(2);
    } catch {
      setErrorStep1('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setResendSuccess('');
    setErrorStep2('');
    try {
      const res = await fetch(getApiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'perusahaan' })
      });
      if (res.ok) {
        setResendSuccess('Kode verifikasi baru berhasil dikirimkan ke email Anda.');
        setResendTimer(60);
      } else {
        setErrorStep2('Gagal mengirim ulang kode. Silakan coba lagi.');
      }
    } catch {
      setErrorStep2('Terjadi kesalahan saat mengirim ulang kode.');
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue && value !== '') return;

    const newOtp = [...otpCode];
    newOtp[index] = cleanValue.slice(-1);
    setOtpCode(newOtp);

    if (cleanValue && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
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
      const targetInput = document.getElementById(`otp-input-${focusIndex}`);
      if (targetInput) targetInput.focus();
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpCode.join('');
    if (enteredOtp.length < 6) { setErrorStep2('Masukkan 6 digit kode verifikasi yang sudah dikirim ke email Anda.'); return; }
    setErrorStep2('');
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl('/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: enteredOtp })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorStep2(typeof data.detail === 'string' ? data.detail : 'Kode verifikasi tidak valid atau sudah kedaluwarsa.');
        setIsLoading(false);
        return;
      }
      localStorage.setItem('access_token', data.access_token);
      setIsLoading(false);
      setStep(3);
    } catch {
      setErrorStep2('Tidak dapat terhubung ke server.');
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      setErrorStep3('Harap isi Nama Perusahaan Resmi.');
      return;
    }
    if (!industri.trim()) {
      setErrorStep3('Harap pilih Sektor Industri.');
      return;
    }
    if (!ukuran.trim()) {
      setErrorStep3('Harap pilih Ukuran Perusahaan.');
      return;
    }
    if (!nibNpwpNumber.trim() || !/^\d+$/.test(nibNpwpNumber)) {
      setErrorStep3('Nomor NIB / NPWP wajib berupa angka.');
      return;
    }
    if (!nibFile && !existingNibUrl) {
      setErrorStep3('Harap unggah bukti dokumen NIB / NPWP Perusahaan (PDF/JPG/PNG).');
      return;
    }
    if (!companyAddress.trim()) {
      setErrorStep3('Harap isi Alamat Lengkap Perusahaan.');
      return;
    }

    if (!hrFullName.trim()) {
      setErrorStep3('Harap isi Nama Lengkap Pendaftar.');
      return;
    }
    if (!whatsappNumber.trim() || !/^\d+$/.test(whatsappNumber)) {
      setErrorStep3('Nomor WhatsApp / Telepon Aktif wajib berupa angka.');
      return;
    }
    if (!hrPosition.trim()) {
      setErrorStep3('Harap isi Jabatan Pendaftar.');
      return;
    }
    if (!idCardFile && !existingIdCardUrl) {
      setErrorStep3('Harap unggah foto ID Card Karyawan atau KTP Pendaftar.');
      return;
    }

    setErrorStep3('');
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('nama_perusahaan', companyName);
      formData.append('industri', industri);
      formData.append('ukuran', ukuran);
      if (websiteUrl) formData.append('website_url', websiteUrl);
      formData.append('alamat', companyAddress);
      formData.append('nib_number', nibNpwpNumber);
      if (nibFile) formData.append('nib_file', nibFile);
      formData.append('hr_name', hrFullName);
      formData.append('hr_whatsapp', whatsappNumber);
      formData.append('hr_position', hrPosition);
      if (idCardFile) formData.append('id_card_file', idCardFile);

      const res = await fetch(getApiUrl('/users/profile'), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorStep3(typeof data?.detail === 'string' ? data.detail : 'Gagal menyimpan data. Coba lagi atau hubungi support.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('pendingCompanyName', companyName);
      localStorage.setItem('pendingNibNumber', nibNpwpNumber);
      localStorage.setItem('pendingHrName', hrFullName);
      localStorage.setItem('pendingWhatsapp', whatsappNumber);
      localStorage.setItem('pendingRegistrationStatus', 'PENDING');
      router.push('/pending-approval');
    } catch {
      setErrorStep3('Tidak dapat terhubung ke server.');
      setIsLoading(false);
    }
  };

  const inputBase =
    'w-full px-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all';
  const inputWithIcon =
    'w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all';
  const labelBase = 'block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1';
  const sectionBox = 'space-y-5 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800';
  const outlineBtn = 'px-6 py-3 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all';
  const primaryBtnFlex = 'flex-1 py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-semibold text-sm shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed';

  const steps = [
    { label: 'Akun & Email' },
    { label: 'Verifikasi Email' },
    { label: 'Data Perusahaan' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans antialiased transition-colors duration-300">

      {/* Header */}
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
              Daftar Akun Perusahaan
            </span>
          </div>
        </Link>
        <Link href="/login" className="text-xs sm:text-sm font-semibold text-[#1A4B9F] hover:underline">
          Sudah punya akun? Masuk
        </Link>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8">

        {/* Step Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-[calc(16.66%)] right-[calc(16.66%)] h-px bg-slate-200 dark:bg-slate-700 z-0" />
            {steps.map((s, i) => {
              const num = i + 1;
              const isActive = step === num;
              const isDone = step > num;
              return (
                <div key={num} className="flex flex-col items-center gap-2 z-10 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone ? 'bg-[#1A4B9F] text-white'
                    : isActive ? 'bg-[#1A4B9F] text-white shadow-md ring-4 ring-blue-100 dark:ring-blue-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {isDone ? <CheckCircle2 size={14} /> : num}
                  </div>
                  <span className={`text-[11px] font-semibold text-center leading-tight ${isActive || isDone ? 'text-[#1A4B9F]' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Buat Akun Perusahaan</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gunakan email domain perusahaan Anda untuk memulai proses pendaftaran.
              </p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div>
                <label className={labelBase}>Email Resmi Perusahaan <span className="text-red-500">*</span></label>
                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorStep1(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('reg-password')?.focus(); } }}
                    placeholder="contoh: hrd@perusahaan.com"
                    className={inputWithIcon}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Email pribadi (Gmail, Yahoo, Outlook) tidak dapat digunakan.
                </p>
              </div>

              <div>
                <label className={labelBase}>Password <span className="text-red-500">*</span></label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorStep1(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('reg-confirm-password')?.focus(); } }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-sm outline-none transition-all"
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
                {password.length > 0 && (
                  <div className="mt-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Persyaratan password:</p>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {([
                        [strength.length, 'Minimal 8 karakter'],
                        [strength.uppercase, 'Huruf kapital (A-Z)'],
                        [strength.lowercase, 'Huruf kecil (a-z)'],
                        [strength.number, 'Angka (0-9)'],
                        [strength.special, 'Karakter khusus (!@#...)'],
                      ] as [boolean, string][]).map(([ok, label], i) => (
                        <div key={i} className={`flex items-center gap-1.5 ${ok ? 'text-green-600 font-semibold' : 'text-slate-400'}`}>
                          {ok ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className={labelBase}>Konfirmasi Password <span className="text-red-500">*</span></label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    id="reg-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrorStep1(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); document.getElementById('reg-submit-btn')?.click(); } }}
                    placeholder="Ulangi password"
                    className={`w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 ${confirmPassword && confirmPassword !== password ? 'border-red-400' : confirmPassword && confirmPassword === password ? 'border-green-400' : 'border-slate-300 dark:border-slate-700 focus:border-[#1A4B9F] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900'} rounded-2xl text-sm outline-none transition-all`}
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
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[11px] text-red-500 mt-1">Password tidak cocok.</p>
                )}
              </div>

              {errorStep1 && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{errorStep1}</span>
                </div>
              )}

              <button
                id="reg-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-full bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-semibold text-sm shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Mengirim kode verifikasi...' : 'Lanjutkan'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Ultra Clean Enterprise Email Verification */}
        {step === 2 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-7 max-w-md mx-auto text-center">
            
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
                  onClick={() => { setStep(1); setErrorStep2(''); setResendSuccess(''); }}
                  className="text-[#1A4B9F] dark:text-blue-400 hover:underline font-semibold text-xs ml-1"
                >
                  (Ubah)
                </button>
              </p>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-6">
              {/* 3 x 3 Split OTP Inputs */}
              <div className="flex justify-center items-center gap-2">
                <div className="flex gap-1.5 sm:gap-2">
                  {otpCode.slice(0, 3).map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
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
                        id={`otp-input-${realIdx}`}
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

              {errorStep2 && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-medium text-center">
                  {errorStep2}
                </div>
              )}

              {resendSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs font-medium text-center">
                  {resendSuccess}
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

              {/* Footer Resend */}
              <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <span>Belum menerima kode? </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isResending}
                  className="text-[#1A4B9F] dark:text-blue-400 font-bold hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {isResending
                    ? 'Mengirim...'
                    : resendTimer > 0
                    ? `Kirim ulang (${resendTimer}s)`
                    : 'Kirim Ulang Kode'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-8">
            <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-5">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dokumen & Data Perusahaan</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Lengkapi informasi berikut untuk diverifikasi oleh tim AI-RecruitPro. Proses verifikasi umumnya membutuhkan 1-2 hari kerja.
              </p>
            </div>

            {isFromIncomplete && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Pemeriksaan Kelengkapan Akun Perusahaan</strong>
                  <span>Akun Anda telah melewati verifikasi OTP. Untuk mengaktifkan akun dan melanjutkan ke dashboard, Anda wajib melengkapi data profil perusahaan serta mengunggah dokumen legalitas resmi (NIB &amp; KTP/ID Card) di bawah ini.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleStep3Submit} className="space-y-8">

              {/* Data Perusahaan */}
              <div className={sectionBox}>
                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-3">
                  <Building2 size={16} className="text-[#1A4B9F]" />
                  <span>Data Perusahaan</span>
                </div>

                <div>
                  <label className={labelBase}>Nama Perusahaan Resmi <span className="text-red-500">*</span></label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Contoh: PT Tokopedia Indonesia" className={inputBase} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>Sektor Industri <span className="text-red-500">*</span></label>
                    <select value={industri} onChange={(e) => setIndustri(e.target.value)} className={inputBase}>
                      <option value="">Pilih sektor</option>
                      <option value="Teknologi Informasi">Teknologi Informasi</option>
                      <option value="Keuangan & Perbankan">Keuangan & Perbankan</option>
                      <option value="Kesehatan">Kesehatan</option>
                      <option value="Pendidikan">Pendidikan</option>
                      <option value="Manufaktur">Manufaktur</option>
                      <option value="Retail & E-commerce">Retail & E-commerce</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelBase}>Jumlah Karyawan <span className="text-red-500">*</span></label>
                    <select value={ukuran} onChange={(e) => setUkuran(e.target.value)} className={inputBase}>
                      <option value="">Pilih rentang</option>
                      <option value="1-50 Karyawan (Startup/Kecil)">1-50 karyawan</option>
                      <option value="51-200 Karyawan (Menengah)">51-200 karyawan</option>
                      <option value="201-1000 Karyawan (Besar)">201-1.000 karyawan</option>
                      <option value="> 1000 Karyawan (Enterprise)">Lebih dari 1.000 karyawan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelBase}>Website Perusahaan <span className="text-slate-400 font-normal">(opsional)</span></label>
                  <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://www.perusahaan.com" className={inputBase} />
                </div>

                <div>
                  <label className={labelBase}>Nomor NIB / NPWP <span className="text-red-500">*</span></label>
                  <input type="text" value={nibNpwpNumber}
                    onChange={(e) => setNibNpwpNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Angka saja, contoh: 9120101928123"
                    className={`${inputBase} font-mono`} />
                </div>

                <div>
                  <label className={labelBase}>Dokumen NIB / NPWP <span className="text-red-500">*</span></label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#1A4B9F] bg-white dark:bg-slate-950 p-5 rounded-2xl text-center space-y-2 cursor-pointer relative transition-colors">
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setNibFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {nibFile ? (
                      <div className="flex flex-col items-center gap-2">
                        {nibFile.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(nibFile)} alt="Preview NIB" className="max-h-28 object-contain rounded-lg border border-slate-200" />
                        ) : (
                          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center">
                            <FileText size={28} className="text-[#1A4B9F] mb-1" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{nibFile.name}</span>
                          </div>
                        )}
                        <span className="text-[11px] text-[#1A4B9F] underline z-20 relative pointer-events-none">Klik untuk ganti</span>
                      </div>
                    ) : existingNibUrl ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          Dokumen NIB/NPWP sudah tersimpan di sistem
                        </div>
                        <span className="text-[11px] font-bold text-[#1b7b9e] underline relative z-20 pointer-events-none">
                          Klik untuk mengganti dengan file baru (Opsional)
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload size={22} className="text-slate-400 mx-auto" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block">Klik atau seret file ke sini</span>
                        <span className="text-[11px] text-slate-400 block">PDF, JPG, PNG — maks. 5 MB</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelBase}>Alamat Kantor <span className="text-red-500">*</span></label>
                  <textarea rows={3} value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Alamat lengkap sesuai NIB atau akta pendirian"
                    className={`${inputBase} resize-none`} />
                </div>
              </div>

              {/* Data HR */}
              <div className={sectionBox}>
                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-3">
                  <User size={16} className="text-[#1A4B9F]" />
                  <span>Data Perwakilan HR</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelBase}>Nama Lengkap <span className="text-red-500">*</span></label>
                    <input type="text" value={hrFullName} onChange={(e) => setHrFullName(e.target.value)}
                      placeholder="Sesuai identitas resmi" className={inputBase} />
                  </div>
                  <div>
                    <label className={labelBase}>Nomor WhatsApp <span className="text-red-500">*</span></label>
                    <input type="text" value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="081234567890" className={`${inputBase} font-mono`} />
                  </div>
                </div>

                <div>
                  <label className={labelBase}>Jabatan <span className="text-red-500">*</span></label>
                  <input type="text" value={hrPosition} onChange={(e) => setHrPosition(e.target.value)}
                    placeholder="Contoh: HR Manager, Talent Acquisition" className={inputBase} />
                </div>

                <div>
                  <label className={labelBase}>Foto ID Card / KTP <span className="text-red-500">*</span></label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#1A4B9F] bg-white dark:bg-slate-950 p-5 rounded-2xl text-center space-y-2 cursor-pointer relative transition-colors">
                    <input type="file" accept=".jpg,.jpeg,.png"
                      onChange={(e) => setIdCardFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {idCardFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={URL.createObjectURL(idCardFile)} alt="Preview ID" className="max-h-28 object-contain rounded-lg border border-slate-200" />
                        <span className="text-[11px] text-[#1A4B9F] underline z-20 relative pointer-events-none">Klik untuk ganti</span>
                      </div>
                    ) : existingIdCardUrl ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          Foto ID Card/KTP sudah tersimpan di sistem
                        </div>
                        <span className="text-[11px] font-bold text-[#1b7b9e] underline relative z-20 pointer-events-none">
                          Klik untuk mengganti dengan file baru (Opsional)
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload size={22} className="text-slate-400 mx-auto" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block">Klik atau seret foto KTP / ID Card</span>
                        <span className="text-[11px] text-slate-400 block">JPG, PNG — maks. 5 MB</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {errorStep3 && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{errorStep3}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setStep(2)} className={outlineBtn}>Kembali</button>
                <button type="submit" disabled={isLoading} className={primaryBtnFlex}>
                  {isLoading ? 'Mengirim data...' : 'Kirim & Ajukan Verifikasi'}
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

export default function CompanyRegistrationFlow() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F0F8FB] text-[#1b7b9e] font-sans">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#1b7b9e] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold">Memuat Formulir Pendaftaran Perusahaan...</span>
          </div>
        </div>
      }
    >
      <CompanyRegistrationInner />
    </Suspense>
  );
}
