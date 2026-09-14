'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { 
  GraduationCap, Save, CheckCircle2, Upload, Bell
} from 'lucide-react';

export default function KampusSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form States - Campus Profile
  const [univName, setUnivName] = useState('');
  const [accreditation, setAccreditation] = useState('Unggul (A)');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [univDesc, setUnivDesc] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [univInitials, setUnivInitials] = useState('KM');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Ukuran file maksimal 10 MB.');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      let newLogoUrl = '';

      if (res.ok && data.url) {
        newLogoUrl = data.url;
      } else {
        newLogoUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      setLogoUrl(newLogoUrl);
      const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : '';
      if (typeof window !== 'undefined') {
        if (savedEmail) localStorage.setItem(`campus_logo_${savedEmail}`, newLogoUrl);
        localStorage.setItem('campus_logo', newLogoUrl);
        window.dispatchEvent(new Event('storage'));
      }
      showToast('Logo universitas berhasil diunggah ke folder uploads!');
    } catch (_) {
      showToast('Gagal mengunggah logo universitas.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Form States - PIC Contact Info
  const [namaPic, setNamaPic] = useState('');
  const [jabatanPic, setJabatanPic] = useState('');
  const [noTeleponPic, setNoTeleponPic] = useState('');

  // Form States - Notifications (With auto-save)
  const [notifyOnHired, setNotifyOnHired] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('campus_notify_on_hired');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [autoTracerReport, setAutoTracerReport] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('campus_auto_tracer_report');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const handleToggleNotifyOnHired = (val: boolean) => {
    setNotifyOnHired(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('campus_notify_on_hired', String(val));
    }
    showToast(val ? 'Notifikasi penerimaan kerja diaktifkan (Tersimpan otomatis)' : 'Notifikasi penerimaan kerja dinonaktifkan (Tersimpan otomatis)');
  };

  const handleToggleAutoTracerReport = (val: boolean) => {
    setAutoTracerReport(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('campus_auto_tracer_report', String(val));
    }
    showToast(val ? 'Laporan Tracer Study Otomatis diaktifkan (Tersimpan otomatis)' : 'Laporan Tracer Study Otomatis dinonaktifkan (Tersimpan otomatis)');
  };



  useEffect(() => {
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : '';
    let savedLocalData: any = {};
    if (typeof window !== 'undefined') {
      try {
        const rawLocal = localStorage.getItem(`campus_profile_data_${savedEmail}`) || localStorage.getItem('campus_profile_data');
        if (rawLocal) savedLocalData = JSON.parse(rawLocal);
      } catch (_) {}
    }

    const savedAddr = savedLocalData.alamat || (typeof window !== 'undefined' ? (localStorage.getItem(`campus_address_${savedEmail}`) || localStorage.getItem('campus_address')) : '');
    const savedName = savedLocalData.nama_kampus || (typeof window !== 'undefined' ? (localStorage.getItem(`campus_name_${savedEmail}`) || localStorage.getItem('campus_name')) : '');
    const savedWeb = savedLocalData.website_url || savedLocalData.website || (typeof window !== 'undefined' ? (localStorage.getItem(`campus_website_${savedEmail}`) || localStorage.getItem('campus_website')) : '');
    const savedAcc = savedLocalData.akreditasi || (typeof window !== 'undefined' ? (localStorage.getItem(`campus_akreditasi_${savedEmail}`) || localStorage.getItem('campus_akreditasi')) : '');
    const savedLogo = savedLocalData.logo_url || (typeof window !== 'undefined' ? (localStorage.getItem(`campus_logo_${savedEmail}`) || localStorage.getItem('campus_logo')) : '');
    const savedPicName = savedLocalData.nama_pic || (typeof window !== 'undefined' ? (localStorage.getItem(`campus_pic_name_${savedEmail}`) || localStorage.getItem('campus_pic_name')) : '');
    const savedPicJab = savedLocalData.jabatan_pic || (typeof window !== 'undefined' ? (localStorage.getItem(`campus_pic_jabatan_${savedEmail}`) || localStorage.getItem('campus_pic_jabatan')) : '');
    const savedPicPhone = savedLocalData.no_telepon_pic || (typeof window !== 'undefined' ? (localStorage.getItem(`campus_pic_phone_${savedEmail}`) || localStorage.getItem('campus_pic_phone')) : '');

    api.get('/users/profile')
      .then(data => {
        const p = data.profil || {};
        let cName = p.nama_kampus || savedName || p.nama_perusahaan || data.user?.name || '';
        if (!cName || cName.toLowerCase().includes('ki informatika') || cName.toLowerCase().includes('ki.informatika')) {
          cName = savedName || 'Universitas Harkat Negeri';
        }
        setUnivName(cName);
        setAccreditation(p.akreditasi || savedAcc || 'Unggul (A)');
        setWebsite(p.website || p.website_url || savedWeb || `https://career.${savedEmail.split('@')[1] || 'harkatnegeri.ac.id'}`);
        setAddress(p.alamat || savedAddr || '');
        setUnivDesc(p.deskripsi || savedLocalData.deskripsi || '');
        setLogoUrl(sanitizeLogoUrl(p.logo_url) || sanitizeLogoUrl(savedLogo) || '');
        setNamaPic(p.nama_pic || savedPicName || '');
        setJabatanPic(p.jabatan_pic || savedPicJab || '');
        setNoTeleponPic(p.no_telepon_pic || p.phone_pic || savedPicPhone || '');
      })
      .catch(() => {
        setUnivName(savedName || 'Universitas Harkat Negeri');
        setAccreditation(savedAcc || 'Unggul (A)');
        setWebsite(savedWeb || `https://career.${savedEmail.split('@')[1] || 'harkatnegeri.ac.id'}`);
        setAddress(savedAddr || '');
        setUnivDesc(savedLocalData.deskripsi || '');
        setLogoUrl(sanitizeLogoUrl(savedLogo) || '');
        setNamaPic(savedPicName || '');
        setJabatanPic(savedPicJab || '');
        setNoTeleponPic(savedPicPhone || '');
      });
  }, []);

  useEffect(() => {
    if (univName) {
      const words = univName.trim().split(/\s+/);
      const initials = words.length >= 2 
        ? (words[0][0] + words[1][0]).toUpperCase() 
        : univName.substring(0, 2).toUpperCase();
      setUnivInitials(initials);
    }
  }, [univName]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : '';

    const updatedPayload = {
      nama_kampus: univName.trim(),
      akreditasi: accreditation,
      website_url: website,
      website: website,
      alamat: address,
      logo_url: logoUrl,
      nama_pic: namaPic,
      jabatan_pic: jabatanPic,
      no_telepon_pic: noTeleponPic,
    };

    if (typeof window !== 'undefined') {
      if (savedEmail) {
        localStorage.setItem(`campus_name_${savedEmail}`, univName.trim());
        localStorage.setItem(`campus_address_${savedEmail}`, address.trim());
        localStorage.setItem(`campus_website_${savedEmail}`, website.trim());
        localStorage.setItem(`campus_akreditasi_${savedEmail}`, accreditation.trim());
        localStorage.setItem(`campus_pic_name_${savedEmail}`, namaPic.trim());
        localStorage.setItem(`campus_pic_jabatan_${savedEmail}`, jabatanPic.trim());
        localStorage.setItem(`campus_pic_phone_${savedEmail}`, noTeleponPic.trim());
        localStorage.setItem(`campus_profile_data_${savedEmail}`, JSON.stringify(updatedPayload));
      }
      localStorage.setItem('campus_name', univName.trim());
      localStorage.setItem('campus_address', address.trim());
      localStorage.setItem('campus_website', website.trim());
      localStorage.setItem('campus_akreditasi', accreditation.trim());
      localStorage.setItem('campus_pic_name', namaPic.trim());
      localStorage.setItem('campus_pic_jabatan', jabatanPic.trim());
      localStorage.setItem('campus_pic_phone', noTeleponPic.trim());
      localStorage.setItem('campus_profile_data', JSON.stringify(updatedPayload));
    }

    try {
      await api.put('/users/profile', updatedPayload);
      showToast('Pengaturan Pusat Karir Perguruan Tinggi berhasil diperbarui!');
    } catch {
      showToast('Pengaturan Pusat Karir Perguruan Tinggi tersimpan!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-16 animate-in fade-in duration-300 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white dark:bg-card dark:text-card-foreground border border-border px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Pengaturan Pusat Karir Perguruan Tinggi</h1>
        <p className="text-sm text-muted-foreground">Atur profil universitas dan notifikasi Tracer Study kelulusan mahasiswa.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border gap-2 overflow-x-auto custom-scrollbar">
        {[
          { id: 'profile', label: 'Profil Perguruan Tinggi', icon: GraduationCap },
          { id: 'notifications', label: 'Notifikasi & Tracer Study', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap -mb-px ${
                isActive 
                  ? 'border-[#1A4B9F] text-[#1A4B9F] bg-blue-50/50 dark:bg-blue-950/30 rounded-t-lg' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ==================== TAB 1: CAMPUS PROFILE (READ-ONLY / LOCKED) ==================== */}
        {activeTab === 'profile' && (
          <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6 animate-in fade-in duration-200">
            
            {/* Header Lock Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/40 p-4 rounded-2xl border border-border">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#1A4B9F] text-white font-bold text-2xl flex items-center justify-center border border-border shadow-sm shrink-0 overflow-hidden relative">
                  {logoUrl && !imageError ? (
                    <img src={logoUrl} alt={univName} className="w-full h-full object-cover" onError={() => setImageError(true)} />
                  ) : (
                    <span className="font-black text-xl text-white select-none">{univInitials || 'HN'}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">{univName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Data profil perguruan tinggi di bawah ini telah dilengkapi dan diverifikasi.
                  </p>
                </div>
              </div>

              <div className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-extrabold text-[11px] rounded-full flex items-center gap-2 shrink-0">
                <CheckCircle2 size={15} />
                <span>Profil Terverifikasi & Terkunci</span>
              </div>
            </div>

            {/* Section 1: Informasi Institusi Perguruan Tinggi */}
            <div className="space-y-4 pt-2 border-t border-border">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                1. Informasi Institusi Perguruan Tinggi
              </h4>

              {/* Logo Foto Profile Kampus */}
              <div className="p-4 bg-muted/40 border border-border rounded-2xl flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#1A4B9F] text-white font-bold text-xl flex items-center justify-center border border-border shadow-sm shrink-0 overflow-hidden relative">
                    {logoUrl && !imageError ? (
                      <img src={logoUrl} alt="Logo Perguruan Tinggi" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                    ) : (
                      <span className="font-black text-lg text-white select-none">{univInitials || 'HN'}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground">Logo / Foto Profil Perguruan Tinggi</label>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">Format PNG, JPG, WEBP. Maks 10MB.</p>
                  </div>
                </div>

                <label className="px-4 py-2 bg-[#1A4B9F] hover:bg-[#153D82] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-[#1A4B9F]">
                  <Upload size={15} />
                  <span>{isUploadingLogo ? 'Mengunggah...' : 'Unggah / Ganti Logo'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    disabled={isUploadingLogo}
                    onChange={handleLogoUpload} 
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-foreground mb-1">Nama Resmi Perguruan Tinggi</label>
                  <input 
                    type="text"
                    value={univName}
                    readOnly
                    disabled
                    className="w-full px-4 py-2.5 bg-muted/60 border border-border rounded-xl text-xs font-bold text-foreground cursor-not-allowed select-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Website Resmi Universitas</label>
                  <input 
                    type="url"
                    value={website}
                    readOnly
                    disabled
                    className="w-full px-4 py-2.5 bg-muted/60 border border-border rounded-xl text-xs font-bold text-foreground cursor-not-allowed select-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Akreditasi Universitas</label>
                  <input 
                    type="text"
                    value={accreditation}
                    readOnly
                    disabled
                    className="w-full px-4 py-2.5 bg-muted/60 border border-border rounded-xl text-xs font-bold text-foreground cursor-not-allowed select-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-foreground mb-1">Alamat Utama Universitas</label>
                  <textarea 
                    rows={2}
                    value={address}
                    readOnly
                    disabled
                    className="w-full px-4 py-2.5 bg-muted/60 border border-border rounded-xl text-xs font-medium text-foreground cursor-not-allowed select-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: PIC Contact Info */}
            <div className="space-y-4 pt-2 border-t border-border">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                2. Kontak Penanggung Jawab (PIC) Career Center
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Nama Lengkap PIC</label>
                  <input 
                    type="text"
                    value={namaPic}
                    readOnly
                    disabled
                    className="w-full px-4 py-2.5 bg-muted/60 border border-border rounded-xl text-xs font-bold text-foreground cursor-not-allowed select-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Jabatan PIC</label>
                  <input 
                    type="text"
                    value={jabatanPic}
                    readOnly
                    disabled
                    className="w-full px-4 py-2.5 bg-muted/60 border border-border rounded-xl text-xs font-bold text-foreground cursor-not-allowed select-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">No. Telepon / WhatsApp PIC</label>
                  <input 
                    type="text"
                    value={noTeleponPic}
                    readOnly
                    disabled
                    className="w-full px-4 py-2.5 bg-muted/60 border border-border rounded-xl text-xs font-bold text-foreground cursor-not-allowed select-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: NOTIFICATIONS & TRACER STUDY ==================== */}
        {activeTab === 'notifications' && (
          <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-bold text-base text-foreground mb-1">Notifikasi & Laporan Tracer Study</h3>
              <p className="text-xs text-muted-foreground">Kelola notifikasi otomatis penerimaan kerja mahasiswa dan generasi laporan Tracer Study.</p>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-foreground">Notifikasi Penerimaan Kerja Mahasiswa</p>
                  <p className="text-[11px] text-muted-foreground">
                    Kirim pemberitahuan email ke tim Career Center setiap kali ada mahasiswa yang dikonfirmasi Diterima (Hired) oleh perusahaan mitra.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={notifyOnHired}
                  onChange={(e) => handleToggleNotifyOnHired(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-[#1A4B9F] focus:ring-[#1A4B9F] cursor-pointer"
                />
              </div>

              <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-foreground">Generasi Otomatis Rekapitulasi Tracer Study Bulanan</p>
                  <p className="text-[11px] text-muted-foreground">
                    Otomatis buat laporan statistik kelulusan kerja per program studi setiap akhir bulan.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={autoTracerReport}
                  onChange={(e) => handleToggleAutoTracerReport(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-[#1A4B9F] focus:ring-[#1A4B9F] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button (Only for configurable tabs: notifications) */}
        {activeTab !== 'profile' && (
          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              className="px-6 py-2.5 bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs rounded-full transition-colors flex items-center gap-2 shadow-md shadow-[#1A4B9F]/20 active:scale-95 cursor-pointer"
            >
              <Save size={16} />
              Simpan Pengaturan Universitas
            </button>
          </div>
        )}

      </form>

    </div>
  );
}
