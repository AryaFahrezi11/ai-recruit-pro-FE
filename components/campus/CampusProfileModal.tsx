'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Building2, MapPin, Globe, Award, User, Briefcase, Phone, 
  CheckCircle2, AlertTriangle, ShieldAlert, X, Mail, Lock
} from 'lucide-react';
import { api, parseErrorMessage } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface CampusProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProfile: any) => void;
  initialData?: {
    nama_kampus?: string;
    email?: string;
    alamat?: string;
    website_url?: string;
    akreditasi?: string;
    logo_url?: string;
    nama_pic?: string;
    jabatan_pic?: string;
    no_telepon_pic?: string;
  };
}

export default function CampusProfileModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = {}
}: CampusProfileModalProps) {
  const [namaKampus, setNamaKampus] = useState(initialData.nama_kampus || '');
  const [email, setEmail] = useState(initialData.email || '');
  const [alamat, setAlamat] = useState(initialData.alamat || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialData.website_url || '');
  const [akreditasi, setAkreditasi] = useState(initialData.akreditasi || 'Unggul (A)');
  const [logoUrl, setLogoUrl] = useState(initialData.logo_url || '');
  const [namaPic, setNamaPic] = useState(initialData.nama_pic || '');
  const [jabatanPic, setJabatanPic] = useState(initialData.jabatan_pic || '');
  const [noTeleponPic, setNoTeleponPic] = useState(initialData.no_telepon_pic || '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);

  const sanitizeLogoUrl = (url: any): string => {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === '[object Object]') return '';
    return trimmed;
  };

  useEffect(() => {
    setImageError(false);
  }, [logoUrl]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('user_email') || '';
      if (savedEmail) setEmail(savedEmail);
      const savedName = localStorage.getItem(`campus_name_${savedEmail}`) || localStorage.getItem('campus_name');
      if (savedName) setNamaKampus(savedName);
      const savedLogo = localStorage.getItem(`campus_logo_${savedEmail}`) || localStorage.getItem('campus_logo');
      if (savedLogo) setLogoUrl(sanitizeLogoUrl(savedLogo));
    }
    if (initialData.nama_kampus) setNamaKampus(initialData.nama_kampus);
    if (initialData.email) setEmail(initialData.email);
    if (initialData.alamat) setAlamat(initialData.alamat);
    if (initialData.website_url) setWebsiteUrl(initialData.website_url);
    if (initialData.akreditasi) setAkreditasi(initialData.akreditasi);
    if (initialData.logo_url) setLogoUrl(sanitizeLogoUrl(initialData.logo_url));
    if (initialData.nama_pic) setNamaPic(initialData.nama_pic);
    if (initialData.jabatan_pic) setJabatanPic(initialData.jabatan_pic);
    if (initialData.no_telepon_pic) setNoTeleponPic(initialData.no_telepon_pic);
  }, [initialData]);

  if (!isOpen) return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar logo maksimal 5 MB.');
      return;
    }

    setIsUploadingLogo(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setLogoUrl(data.url);
        toast.success('Foto / Logo kampus berhasil diunggah ke folder upload!');
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (_) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!logoUrl.trim()) {
      setError('Unggah Logo / Foto Profil Perguruan Tinggi terlebih dahulu (Wajib diisi).');
      return;
    }
    if (!namaKampus.trim()) {
      setError('Masukkan nama resmi kampus / institusi Anda (Wajib diisi).');
      return;
    }
    if (!websiteUrl.trim()) {
      setError('Masukkan alamat URL website resmi kampus (Wajib diisi).');
      return;
    }
    if (!akreditasi.trim()) {
      setError('Pilih akreditasi kampus Anda (Wajib diisi).');
      return;
    }
    if (!alamat.trim()) {
      setError('Masukkan alamat kampus utama (Wajib diisi).');
      return;
    }
    if (!namaPic.trim()) {
      setError('Masukkan nama penanggung jawab (PIC) Career Center (Wajib diisi).');
      return;
    }
    if (!jabatanPic.trim()) {
      setError('Masukkan jabatan PIC Career Center (Wajib diisi).');
      return;
    }
    if (!noTeleponPic.trim()) {
      setError('Masukkan nomor telepon / WhatsApp PIC (Wajib diisi).');
      return;
    }

    setIsLoading(true);

    const payload = {
      nama_kampus: namaKampus.trim(),
      alamat: alamat.trim(),
      website_url: websiteUrl.trim(),
      website: websiteUrl.trim(),
      akreditasi: akreditasi.trim(),
      logo_url: logoUrl,
      nama_pic: namaPic.trim(),
      jabatan_pic: jabatanPic.trim(),
      no_telepon_pic: noTeleponPic.trim(),
    };

    try {
      await api.put('/users/profile', payload);
      const email = typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : '';
      if (email) {
        localStorage.setItem(`campus_profile_completed_${email}`, 'true');
        localStorage.setItem(`campus_name_${email}`, namaKampus.trim());
        localStorage.setItem(`campus_address_${email}`, alamat.trim());
        localStorage.setItem(`campus_website_${email}`, websiteUrl.trim());
        localStorage.setItem(`campus_akreditasi_${email}`, akreditasi.trim());
        localStorage.setItem(`campus_logo_${email}`, logoUrl);
        localStorage.setItem(`campus_pic_name_${email}`, namaPic.trim());
        localStorage.setItem(`campus_pic_jabatan_${email}`, jabatanPic.trim());
        localStorage.setItem(`campus_pic_phone_${email}`, noTeleponPic.trim());
        localStorage.setItem(`campus_profile_data_${email}`, JSON.stringify(payload));
      }
      localStorage.setItem('campus_name', namaKampus.trim());
      localStorage.setItem('campus_address', alamat.trim());
      localStorage.setItem('campus_website', websiteUrl.trim());
      localStorage.setItem('campus_akreditasi', akreditasi.trim());
      localStorage.setItem('campus_logo', logoUrl);
      localStorage.setItem('campus_pic_name', namaPic.trim());
      localStorage.setItem('campus_pic_jabatan', jabatanPic.trim());
      localStorage.setItem('campus_pic_phone', noTeleponPic.trim());
      localStorage.setItem('campus_profile_data', JSON.stringify(payload));
      localStorage.setItem('campus_profile_completed', 'true');
      toast.success('Profil Perguruan Tinggi berhasil dilengkapi! Seluruh fitur Dasbor Kampus telah aktif.');
      onSuccess({ ...payload, logo_url: logoUrl });
      onClose();
    } catch (err: any) {
      const errorMsg = parseErrorMessage(err);
      setError(errorMsg || 'Gagal menyimpan ke database server. Silakan coba beberapa saat lagi.');
      toast.error('Gagal menyimpan profil ke database server: ' + (errorMsg || 'Terjadi kesalahan'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header - SOLID COLOR #1A4B9F (NO GRADIENT) */}
        <div className="bg-[#1A4B9F] p-6 sm:p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Tutup (Akses Fitur Terkunci)"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
              <GraduationCap size={22} />
            </div>
            <span className="px-3 py-1 bg-white/20 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider border border-white/30">
              Wajib Dilengkapi
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Lengkapi Profil Perguruan Tinggi
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 leading-relaxed">
            Harap lengkapi seluruh data profil kampus di bawah ini untuk membuka akses penuh ke Dasbor Rekrutmen & Tracker Mahasiswa.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Section 1: Institutional Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
              <Building2 size={15} className="text-[#1A4B9F] dark:text-blue-400" />
              1. Informasi Institusi Perguruan Tinggi
            </h3>

            {/* Upload Logo / Foto Profile Perguruan Tinggi (WAJIB) */}
            <div className="p-4 bg-muted/40 border border-border rounded-2xl space-y-3">
              <label className="block text-xs font-bold text-foreground">
                Logo / Foto Profil Perguruan Tinggi <span className="text-rose-500">* (Wajib Diisi)</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#1A4B9F] text-white font-bold text-2xl flex items-center justify-center border border-border shadow-sm shrink-0 overflow-hidden relative">
                  {logoUrl && !imageError ? (
                    <img src={logoUrl} alt="Logo Kampus" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                  ) : (
                    <Building2 size={28} className="text-white/80" />
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <input 
                    type="file" 
                    id="campus-logo-input" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                    className="hidden" 
                  />
                  <label 
                    htmlFor="campus-logo-input"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A4B9F] hover:bg-[#133878] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <span>{isUploadingLogo ? 'Mengunggah ke Folder Upload...' : logoUrl ? 'Ganti Foto / Logo' : 'Unggah Foto / Logo Kampus'}</span>
                  </label>
                  <p className="text-[11px] text-muted-foreground">Disimpan otomatis ke folder uploads/ (Format JPG, PNG, WEBP Maks 5MB).</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Nama Resmi Perguruan Tinggi (TERKUNCI / READ-ONLY) */}
              <div className="sm:col-span-2 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-foreground">
                    Nama Resmi Perguruan Tinggi <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                    <Lock size={12} className="text-emerald-500" /> Terkunci dari registrasi
                  </span>
                </div>
                <div className="relative flex items-center">
                  <Building2 size={16} className="absolute left-3.5 text-muted-foreground" />
                  <input 
                    type="text"
                    value={namaKampus}
                    readOnly
                    disabled
                    placeholder="Universitas Harkat Negeri"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/60 border border-border rounded-xl text-xs font-bold text-foreground cursor-not-allowed select-none opacity-90"
                    required
                  />
                </div>
              </div>

              {/* Email Resmi Universitas (TERVERIFIKASI / READ-ONLY) */}
              <div className="sm:col-span-2 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-foreground">
                    Email Resmi Perguruan Tinggi <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Terverifikasi
                  </span>
                </div>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3.5 text-muted-foreground" />
                  <input 
                    type="email"
                    value={email}
                    readOnly
                    disabled
                    placeholder="cdc@kampus.ac.id"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/60 border border-border rounded-xl text-xs font-bold text-foreground font-mono cursor-not-allowed select-none opacity-90"
                    required
                  />
                </div>
              </div>

              {/* Website URL */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-foreground">
                  Website Resmi Universitas <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Globe size={16} className="absolute left-3.5 text-muted-foreground" />
                  <input 
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://career.universitas.ac.id"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:border-[#1A4B9F]"
                    required
                  />
                </div>
              </div>

              {/* Akreditasi */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-foreground">
                  Akreditasi Universitas <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Award size={16} className="absolute left-3.5 text-muted-foreground pointer-events-none" />
                  <select
                    value={akreditasi}
                    onChange={(e) => setAkreditasi(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-[#1A4B9F] cursor-pointer"
                    required
                  >
                    <option value="Unggul (A)">Unggul / Akreditasi A</option>
                    <option value="Baik Sekali (B)">Baik Sekali / Akreditasi B</option>
                    <option value="Baik (C)">Baik / Akreditasi C</option>
                    <option value="Internasional">Terakreditasi Internasional</option>
                  </select>
                </div>
              </div>

              {/* Alamat */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-foreground">
                  Alamat Utama Universitas <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
                  <textarea 
                    rows={2}
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Masukkan alamat lengkap gedung rektorat / Career Center universitas..."
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:border-[#1A4B9F] resize-none"
                    required
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: PIC Contact Info */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
              <User size={15} className="text-[#1A4B9F] dark:text-blue-400" />
              2. Kontak Penanggung Jawab (PIC) Career Center
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Nama PIC */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-foreground">
                  Nama Lengkap PIC <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3.5 text-muted-foreground" />
                  <input 
                    type="text"
                    value={namaPic}
                    onChange={(e) => setNamaPic(e.target.value)}
                    placeholder="contoh: Dr. Hendra Wijaya"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:border-[#1A4B9F]"
                    required
                  />
                </div>
              </div>

              {/* Jabatan PIC */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-foreground">
                  Jabatan PIC <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Briefcase size={16} className="absolute left-3.5 text-muted-foreground" />
                  <input 
                    type="text"
                    value={jabatanPic}
                    onChange={(e) => setJabatanPic(e.target.value)}
                    placeholder="contoh: Kepala Career Center"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:border-[#1A4B9F]"
                    required
                  />
                </div>
              </div>

              {/* Telepon PIC */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-foreground">
                  Nomor Telepon / WhatsApp PIC <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Phone size={16} className="absolute left-3.5 text-muted-foreground" />
                  <input 
                    type="tel"
                    value={noTeleponPic}
                    onChange={(e) => setNoTeleponPic(e.target.value)}
                    placeholder="contoh: 081234567890"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs font-medium text-foreground focus:outline-none focus:border-[#1A4B9F] font-mono"
                    required
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Info Banner */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex items-start gap-3">
            <ShieldAlert size={18} className="text-[#1A4B9F] dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#1A4B9F] dark:text-blue-300 leading-relaxed font-medium">
              Data profil ini digunakan untuk verifikasi resmi integrasi AI-RecruitPro dengan universitas Anda. Seluruh fitur dasbor rekrutmen akan langsung aktif begitu profil disimpan.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-semibold text-sm rounded-full shadow-md shadow-[#1A4B9F]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 size={16} />
              <span>{isLoading ? 'Menyimpan Profil...' : 'Simpan & Aktifkan Fitur Dasbor'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
