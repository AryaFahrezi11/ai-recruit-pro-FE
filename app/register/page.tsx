'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Upload,
  User,
  Phone,
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  HelpCircle,
  FileCheck
} from 'lucide-react';

export default function CompanyRegistrationFlow() {
  const router = useRouter();

  // Multi-step state: 1 (Email & Pass), 2 (OTP), 3 (Legalitas Form), 4 (Pending)
  const [step, setStep] = useState<number>(1);

  // Step 1: Account & Email
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorStep1, setErrorStep1] = useState('');

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

  // Step 2: OTP
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [errorStep2, setErrorStep2] = useState('');

  // Step 3: Legal Data - Perusahaan
  const [companyName, setCompanyName] = useState('');
  const [industri, setIndustri] = useState('');
  const [ukuran, setUkuran] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [nibNpwpNumber, setNibNpwpNumber] = useState('');
  const [nibFile, setNibFile] = useState<File | null>(null);
  const [companyAddress, setCompanyAddress] = useState('');

  // Step 3: Legal Data - Perwakilan HR
  const [hrFullName, setHrFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [hrPosition, setHrPosition] = useState('');
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [errorStep3, setErrorStep3] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // List of blocked free email domains
  const freeEmailDomains = [
    'gmail.com', 'yahoo.com', 'yahoo.co.id', 'ymail.com',
    'hotmail.com', 'outlook.com', 'live.com', 'icloud.com',
    'aol.com', 'zoho.com', 'protonmail.com'
  ];

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorStep1('Harap masukkan alamat email perusahaan yang valid.');
      return;
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (freeEmailDomains.includes(domain)) {
      setErrorStep1('Pendaftaran Ditolak: Anda menggunakan email pribadi (Gmail/Yahoo). Harap gunakan email domain perusahaan resmi (contoh: hrd@tokopedia.com, recruitment@bankmandiri.co.id).');
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

    setErrorStep1('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'perusahaan' })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        const errorMsg = typeof data.detail === 'string' 
          ? data.detail 
          : 'Terjadi kesalahan saat registrasi. Pastikan data valid.';
        setErrorStep1(errorMsg);
        setIsLoading(false);
        return;
      }
      
      // Success, move to Step 2
      setIsLoading(false);
      setStep(2);
    } catch (err) {
      const errorMsg = 'Tidak dapat terhubung ke server. Pastikan backend berjalan.';
      setErrorStep1(errorMsg);
      setIsLoading(false);
    }
  };

  // Validate Step 2 (OTP)
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpCode.join('');
    if (enteredOtp.length < 6) {
      setErrorStep2('Harap masukkan 6 digit kode OTP yang telah dikirim ke email perusahaan Anda.');
      return;
    }

    setErrorStep2('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: enteredOtp })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        const errorMsg = typeof data.detail === 'string' 
          ? data.detail 
          : 'Kode OTP tidak valid atau sudah kadaluarsa.';
        setErrorStep2(errorMsg);
        setIsLoading(false);
        return;
      }
      
      // Store token
      localStorage.setItem('access_token', data.access_token);
      setIsLoading(false);
      setStep(3);
    } catch (err) {
      const errorMsg = 'Tidak dapat terhubung ke server untuk verifikasi OTP.';
      setErrorStep2(errorMsg);
      setIsLoading(false);
    }
  };

  // Validate Step 3 (Legalitas Form)
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
    if (!nibFile) {
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
    if (!idCardFile) {
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

      const res = await fetch('http://localhost:8000/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let errorMsg = 'Gagal menyimpan data profil perusahaan. Sesi mungkin kadaluarsa.';
        if (typeof data?.detail === 'string') {
          errorMsg = data.detail;
        } else if (Array.isArray(data?.detail)) {
          errorMsg = 'Validation Error: ' + JSON.stringify(data.detail);
        }
        setErrorStep3(errorMsg);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      // Save pending registration session details
      localStorage.setItem('pendingCompanyName', companyName);
      localStorage.setItem('pendingNibNumber', nibNpwpNumber);
      localStorage.setItem('pendingHrName', hrFullName);
      localStorage.setItem('pendingWhatsapp', whatsappNumber);
      localStorage.setItem('pendingRegistrationStatus', 'PENDING');

      router.push('/pending-approval');
    } catch (err) {
      const errorMsg = 'Tidak dapat terhubung ke server.';
      setErrorStep3(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F8FB] text-[#1b7b9e] flex flex-col justify-between font-sans antialiased">

      {/* Top Header */}
      <header className="py-6 px-6 sm:px-12 max-w-[1600px] w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#1b7b9e] text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
            RP
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-[#0c2b3d] leading-none">
              AI-Recruit <span className="text-[#1D7FA1]">Pro</span>
            </span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
              Pendaftaran Perusahaan
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="text-xs sm:text-sm font-bold text-[#1b7b9e] hover:underline flex items-center gap-1.5"
        >
          Sudah Memiliki Akun? Sign In &rarr;
        </Link>
      </header>

      {/* Main Wizard Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">

        {/* Progress Step Header Bar */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-[#C2E5EF] mb-8">
          <div className="grid grid-cols-3 gap-2 text-center relative">

            {/* Step 1 Indicator */}
            <div className={`flex flex-col items-center space-y-1.5 z-10 ${step >= 1 ? 'text-[#1b7b9e]' : 'text-slate-400'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all ${step >= 1 ? 'bg-[#1b7b9e] text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                }`}>
                1
              </div>
              <span className="text-[11px] font-extrabold">Akun &amp; Email</span>
            </div>

            {/* Step 2 Indicator */}
            <div className={`flex flex-col items-center space-y-1.5 z-10 ${step >= 2 ? 'text-[#1b7b9e]' : 'text-slate-400'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all ${step >= 2 ? 'bg-[#1b7b9e] text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                }`}>
                2
              </div>
              <span className="text-[11px] font-extrabold">Verifikasi OTP</span>
            </div>

            {/* Step 3 Indicator */}
            <div className={`flex flex-col items-center space-y-1.5 z-10 ${step >= 3 ? 'text-[#1b7b9e]' : 'text-slate-400'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all ${step >= 3 ? 'bg-[#1b7b9e] text-white shadow-sm' : 'bg-slate-100 text-slate-400'
                }`}>
                3
              </div>
              <span className="text-[11px] font-extrabold">Bukti Legalitas</span>
            </div>

          </div>
        </div>

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#C2E5EF] space-y-7">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E0F1F7] text-[#1b7b9e] text-xs font-extrabold border border-[#B8E1ED]">
                <Building2 size={14} /> Langkah 1 dari 3: Registrasi Akun Perusahaan
              </div>
              <h1 className="text-3xl font-black text-[#1b7b9e]">Buat Akun Perusahaan Baru</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Gunakan email domain perusahaan resmi Anda untuk memulai verifikasi akun HR.
              </p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-5">

              {/* Corporate Email */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Email Perusahaan Resmi <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorStep1(''); }}
                    placeholder="Contoh: hrd@tokopedia.com, recruitment@bankmandiri.co.id"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-300 focus:border-[#1b7b9e] focus:ring-2 focus:ring-cyan-100 rounded-2xl text-sm outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  ⚠️ Email pribadi (Gmail/Yahoo/Outlook) otomatis ditolak oleh sistem.
                </p>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorStep1(''); }}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-300 focus:border-[#1b7b9e] focus:ring-2 focus:ring-cyan-100 rounded-2xl text-sm outline-none transition-all"
                  />
                </div>
                
                {/* Password Strength Indicator */}
                <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 mb-2">Persyaratan Kata Sandi:</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className={`flex items-center gap-1.5 ${strength.length ? 'text-green-600 font-bold' : 'text-slate-500'}`}>
                      {strength.length ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                      Minimal 8 Karakter
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.uppercase ? 'text-green-600 font-bold' : 'text-slate-500'}`}>
                      {strength.uppercase ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                      Huruf Kapital (A-Z)
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.lowercase ? 'text-green-600 font-bold' : 'text-slate-500'}`}>
                      {strength.lowercase ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                      Huruf Kecil (a-z)
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.number ? 'text-green-600 font-bold' : 'text-slate-500'}`}>
                      {strength.number ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                      Angka (0-9)
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.special ? 'text-green-600 font-bold' : 'text-slate-500'}`}>
                      {strength.special ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
                      Karakter Spesial
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrorStep1(''); }}
                    placeholder="Ulangi Kata Sandi"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-300 focus:border-[#1b7b9e] focus:ring-2 focus:ring-cyan-100 rounded-2xl text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorStep1 && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-3 leading-relaxed">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <span>{errorStep1}</span>
                </div>
              )}



              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Mengirim Kode OTP...</span>
                ) : (
                  <>
                    <span>Lanjutkan &amp; Kirim Kode OTP</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

            </form>
          </div>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#C2E5EF] space-y-7">
            <div className="space-y-2 text-center">
              <div className="w-14 h-14 bg-[#E0F1F7] border border-[#B8E1ED] rounded-2xl flex items-center justify-center text-[#1b7b9e] mx-auto">
                <Mail size={28} />
              </div>
              <h2 className="text-2xl font-black text-[#1b7b9e]">Masukkan Kode OTP Email</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Kami telah mengirimkan 6-digit kode verifikasi OTP ke email perusahaan resmi: <strong className="text-[#1b7b9e]">{email}</strong>.
              </p>
            </div>

            <form onSubmit={handleStep2Submit} className="space-y-6">

              {/* 6 Digit Inputs */}
              <div className="flex justify-center items-center gap-2 sm:gap-3">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl font-black text-[#1b7b9e] bg-[#F0F8FB] border-2 border-[#C2E5EF] focus:border-[#1b7b9e] focus:bg-white rounded-2xl outline-none transition-all"
                  />
                ))}
              </div>

              {errorStep2 && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
                  {errorStep2}
                </div>
              )}



              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  &larr; Kembali
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>Memverifikasi OTP...</span>
                  ) : (
                    <>
                      <span>Verifikasi &amp; Lanjut Form Legalitas</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* STEP 3: Company Legal Verification Form */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#C2E5EF] space-y-8">
            <div className="space-y-2 border-b border-slate-100 pb-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E0F1F7] text-[#1b7b9e] text-xs font-extrabold border border-[#B8E1ED]">
                <FileCheck size={14} /> Langkah 3 dari 3: Verifikasi Bukti Legalitas Perusahaan
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1b7b9e]">Formulir Dokumen Resmi &amp; Perwakilan HR</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Lengkapi berkas hukum perusahaan untuk ditinjau oleh Administrator Developer AI-Recruit Pro.
              </p>
            </div>

            <form onSubmit={handleStep3Submit} className="space-y-8">

              {/* BAGIAN 1: DATA PERUSAHAAN (SESUAI DOKUMEN RESMI) */}
              <div className="space-y-5 bg-[#F0F8FB] p-6 rounded-3xl border border-[#C2E5EF]">
                <div className="flex items-center gap-2 text-sm font-black text-[#1b7b9e] uppercase tracking-wider border-b border-[#C2E5EF] pb-3">
                  <Building2 size={18} />
                  <span>BAGIAN 1: DATA PERUSAHAAN (SESUAI DOKUMEN RESMI)</span>
                </div>

                {/* Nama Perusahaan */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Nama Perusahaan Resmi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Contoh: PT Tokopedia Indonesia"
                    className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-[#1b7b9e] rounded-2xl text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sektor Industri */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Sektor Industri <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={industri}
                      onChange={(e) => setIndustri(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-[#1b7b9e] rounded-2xl text-sm outline-none"
                    >
                      <option value="">-- Pilih Sektor --</option>
                      <option value="Teknologi Informasi">Teknologi Informasi</option>
                      <option value="Keuangan & Perbankan">Keuangan & Perbankan</option>
                      <option value="Kesehatan">Kesehatan</option>
                      <option value="Pendidikan">Pendidikan</option>
                      <option value="Manufaktur">Manufaktur</option>
                      <option value="Retail & E-commerce">Retail & E-commerce</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  {/* Ukuran Perusahaan */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Ukuran Perusahaan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={ukuran}
                      onChange={(e) => setUkuran(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-[#1b7b9e] rounded-2xl text-sm outline-none"
                    >
                      <option value="">-- Pilih Ukuran --</option>
                      <option value="1-50 Karyawan (Startup/Kecil)">1-50 Karyawan (Startup/Kecil)</option>
                      <option value="51-200 Karyawan (Menengah)">51-200 Karyawan (Menengah)</option>
                      <option value="201-1000 Karyawan (Besar)">201-1000 Karyawan (Besar)</option>
                      <option value="> 1000 Karyawan (Enterprise)">-1000 Karyawan (Enterprise)</option>
                    </select>
                  </div>
                </div>

                {/* Website URL */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://www.perusahaananda.com"
                    className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-[#1b7b9e] rounded-2xl text-sm outline-none"
                  />
                </div>

                {/* NIB / NPWP Number */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Nomor Induk Berusaha (NIB) / NPWP Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nibNpwpNumber}
                    onChange={(e) => setNibNpwpNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Input angka NIB/NPWP (misal: 9120101928123)"
                    className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-[#1b7b9e] rounded-2xl text-sm outline-none font-mono"
                  />
                </div>

                {/* Upload NIB / NPWP Document */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Upload Dokumen NIB / NPWP (File Fisik) <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-[#B8E1ED] hover:border-[#1b7b9e] bg-white p-5 rounded-2xl text-center space-y-2 cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setNibFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {nibFile ? (
                      <div className="flex flex-col items-center gap-2">
                        {nibFile.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(nibFile)} alt="Preview NIB" className="max-h-32 object-contain rounded-lg border border-slate-200" />
                        ) : (
                          <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center">
                            <FileText size={32} className="text-[#1b7b9e] mb-1" />
                            <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">{nibFile.name}</span>
                          </div>
                        )}
                        <span className="text-[11px] font-bold text-[#1b7b9e] underline relative z-20 pointer-events-none">Klik untuk ganti file</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-[#1b7b9e] mx-auto" />
                        <span className="text-xs font-bold text-[#1b7b9e] block">
                          Klik / Drag & Drop Dokumen NIB / NPWP (PDF, JPG, PNG)
                        </span>
                        <span className="text-[11px] text-slate-400 block">Maksimal Ukuran File: 5MB</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Address Textarea */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Alamat Lengkap Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Alamat Kantor Pusat Sesuai Akta Pendirian / NIB..."
                    className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-[#1b7b9e] rounded-2xl text-sm outline-none"
                  />
                </div>

              </div>

              {/* BAGIAN 2: DATA PERWAKILAN (HRD/REKRUTER) */}
              <div className="space-y-5 bg-[#F0F8FB] p-6 rounded-3xl border border-[#C2E5EF]">
                <div className="flex items-center gap-2 text-sm font-black text-[#1b7b9e] uppercase tracking-wider border-b border-[#C2E5EF] pb-3">
                  <User size={18} />
                  <span>BAGIAN 2: DATA PERWAKILAN (HRD / REKRUTER)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama HR */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Nama Lengkap Pendaftar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={hrFullName}
                      onChange={(e) => setHrFullName(e.target.value)}
                      placeholder="Nama Lengkap Sesuai ID Card"
                      className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-[#1b7b9e] rounded-2xl text-sm outline-none"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Nomor WhatsApp / Telepon Aktif <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="081234567890 (Angka Only)"
                      className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-[#1b7b9e] rounded-2xl text-sm outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Jabatan */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Jabatan Dalam Perusahaan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={hrPosition}
                    onChange={(e) => setHrPosition(e.target.value)}
                    placeholder="Contoh: HR Manager / Talent Acquisition Lead"
                    className="w-full px-4 py-3 bg-white border border-slate-300 focus:border-[#1b7b9e] rounded-2xl text-sm outline-none"
                  />
                </div>

                {/* Upload ID Card / KTP */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Upload ID Card Karyawan / KTP Pendaftar <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-[#B8E1ED] hover:border-[#1b7b9e] bg-white p-5 rounded-2xl text-center space-y-2 cursor-pointer relative">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => setIdCardFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {idCardFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={URL.createObjectURL(idCardFile)} alt="Preview ID Card" className="max-h-32 object-contain rounded-lg border border-slate-200" />
                        <span className="text-[11px] font-bold text-[#1b7b9e] underline relative z-20 pointer-events-none">Klik untuk ganti file</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-[#1b7b9e] mx-auto" />
                        <span className="text-xs font-bold text-[#1b7b9e] block">
                          Klik / Drag & Drop Foto ID Card Karyawan / KTP (JPG, PNG)
                        </span>
                        <span className="text-[11px] text-slate-400 block">Untuk memastikan keabsahan perwakilan perusahaan</span>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Error Message */}
              {errorStep3 && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-3">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <span>{errorStep3}</span>
                </div>
              )}



              {/* Submit Buttons */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3.5 rounded-full border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  &larr; Kembali
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-4 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-black text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>Mengirimkan Berkas Legalitas...</span>
                  ) : (
                    <>
                      <span>Kirim Data Legalitas &amp; Ajukan Verifikasi</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#C2E5EF] bg-white text-center text-xs text-slate-400 mt-12">
        &copy; {new Date().getFullYear()} AI-Recruit Pro Corporate Legal Validation System.
      </footer>

    </div>
  );
}
