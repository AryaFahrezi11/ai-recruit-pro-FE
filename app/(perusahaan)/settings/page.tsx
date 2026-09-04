'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { fetchAuth } from '@/lib/api/auth';
import { getApiUrl, getMediaUrl } from '@/lib/api';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  Building2, Mail, Save, CheckCircle2, Upload
} from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'email'>('profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form States - Profile
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('100 - 500 Employees');
  const [website, setWebsite] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kota, setKota] = useState('');
  const [provinsi, setProvinsi] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [tahunBerdiri, setTahunBerdiri] = useState<number | ''>('');
  const [hrName, setHrName] = useState('');
  const [hrWhatsapp, setHrWhatsapp] = useState('');
  const [hrPosition, setHrPosition] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = useAppStore(state => state.token);

  // Form States - Email
  const [emailInvSubject, setEmailInvSubject] = useState('');
  const [emailInvBody, setEmailInvBody] = useState('');
  const [emailHireSubject, setEmailHireSubject] = useState('');
  const [emailHireBody, setEmailHireBody] = useState('');
  const [emailRejectSubject, setEmailRejectSubject] = useState('');
  const [emailRejectBody, setEmailRejectBody] = useState('');

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAuth('/api/perusahaan/settings', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();

        // Profile
        setCompanyName(data.profile.nama_perusahaan || '');
        setIndustry(data.profile.industri || '');
        setCompanySize(data.profile.ukuran || '100 - 500 Employees');
        setWebsite(data.profile.website_url || '');
        setCompanyDesc(data.profile.deskripsi || '');
        setLogoUrl(data.profile.logo_url || '');
        setAlamat(data.profile.alamat || '');
        setKota(data.profile.kota || '');
        setProvinsi(data.profile.provinsi || '');
        setNoTelepon(data.profile.no_telepon || '');
        setTahunBerdiri(data.profile.tahun_berdiri || '');
        setHrName(data.profile.hr_name || '');
        setHrWhatsapp(data.profile.hr_whatsapp || '');
        setHrPosition(data.profile.hr_position || '');

        // Email Templates
        setEmailInvSubject(data.email_templates.email_invitation_subject || '');
        setEmailInvBody(data.email_templates.email_invitation_body || '');
        setEmailHireSubject(data.email_templates.email_hire_subject || '');
        setEmailHireBody(data.email_templates.email_hire_body || '');
        setEmailRejectSubject(data.email_templates.email_reject_subject || '');
        setEmailRejectBody(data.email_templates.email_reject_body || '');
      }
    } catch (error) {
      console.error("Gagal memuat pengaturan", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        nama_perusahaan: companyName,
        industri: industry,
        ukuran: companySize,
        website_url: website,
        deskripsi: companyDesc,
        alamat,
        kota,
        provinsi,
        no_telepon: noTelepon,
        tahun_berdiri: tahunBerdiri === '' ? null : tahunBerdiri,
        hr_name: hrName,
        hr_whatsapp: hrWhatsapp,
        hr_position: hrPosition,
        email_invitation_subject: emailInvSubject,
        email_invitation_body: emailInvBody,
        email_hire_subject: emailHireSubject,
        email_hire_body: emailHireBody,
        email_reject_subject: emailRejectSubject,
        email_reject_body: emailRejectBody,
      };

      const res = await fetchAuth('/api/perusahaan/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(t.settings.settingsSaved);
      } else {
        alert("Gagal menyimpan pengaturan.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(getApiUrl('/perusahaan/settings/logo'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setLogoUrl(data.logo_url);
        showToast('Logo berhasil diperbarui');
      } else {
        alert("Gagal mengunggah logo.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan saat mengunggah.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-foreground mb-1">{t.settings.title}</h1>
        <p className="text-sm text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border gap-2 overflow-x-auto custom-scrollbar">
        {[
          { id: 'profile', label: t.settings.companyProfileTab, icon: Building2 },
          { id: 'email', label: t.settings.emailTemplatesTab, icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap -mb-px ${isActive
                  ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
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

        {/* ==================== TAB 1: COMPANY PROFILE ==================== */}
        {activeTab === 'profile' && (
          <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-8 animate-in fade-in duration-200">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-primary text-primary-foreground font-bold text-3xl flex items-center justify-center border border-border shadow-inner shrink-0 overflow-hidden">
                {logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={getMediaUrl(logoUrl)} alt="Logo Perusahaan" className="w-full h-full object-cover" />
                ) : (
                  companyName ? companyName.charAt(0).toUpperCase() : 'RP'
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">{companyName || 'Nama Perusahaan'}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Logo Perusahaan (Digunakan pada header portal pelamar)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Upload size={12} />
                  Ubah Logo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">

              <div className="col-span-1 md:col-span-2">
                <h4 className="text-sm font-bold text-foreground mb-4">Informasi Utama</h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Nama Perusahaan</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Industri</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Ukuran Perusahaan</label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="1 - 50 Employees">1 - 50 Karyawan</option>
                  <option value="50 - 100 Employees">50 - 100 Karyawan</option>
                  <option value="100 - 500 Employees">100 - 500 Karyawan</option>
                  <option value="500+ Employees">500+ Karyawan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Website Resmi</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Nomor Telepon / Kantor</label>
                <input
                  type="text"
                  value={noTelepon}
                  onChange={(e) => setNoTelepon(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Tahun Berdiri</label>
                <input
                  type="number"
                  value={tahunBerdiri}
                  onChange={(e) => setTahunBerdiri(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-2">Deskripsi Perusahaan</label>
                <textarea
                  rows={3}
                  value={companyDesc}
                  onChange={(e) => setCompanyDesc(e.target.value)}
                  className="w-full p-4 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                ></textarea>
              </div>

              {/* LOCATION SECTION */}
              <div className="col-span-1 md:col-span-2 pt-6 mt-2 border-t border-border">
                <h4 className="text-sm font-bold text-foreground mb-4">Alamat & Lokasi</h4>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-2">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full p-4 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Kota</label>
                <input
                  type="text"
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Provinsi</label>
                <input
                  type="text"
                  value={provinsi}
                  onChange={(e) => setProvinsi(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* HR CONTACT SECTION */}
              <div className="col-span-1 md:col-span-2 pt-6 mt-2 border-t border-border">
                <h4 className="text-sm font-bold text-foreground mb-4">Kontak HR (Untuk Keperluan Internal)</h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Nama Penanggung Jawab HR</label>
                <input
                  type="text"
                  value={hrName}
                  onChange={(e) => setHrName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Jabatan HR</label>
                <input
                  type="text"
                  value={hrPosition}
                  onChange={(e) => setHrPosition(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Nomor WhatsApp HR</label>
                <input
                  type="text"
                  value={hrWhatsapp}
                  onChange={(e) => setHrWhatsapp(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

            </div>
          </div>
        )}

        {/* ==================== TAB 2: EMAIL TEMPLATES ==================== */}
        {activeTab === 'email' && (
          <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-8 animate-in fade-in duration-200">
            <div>
              <h3 className="font-bold text-base text-foreground mb-1">Template Email Otomatis</h3>
              <p className="text-xs text-muted-foreground">Sesuaikan subjek dan pesan email pemberitahuan yang dikirim otomatis ke kandidat. Gunakan tag dinamis seperti <code>{`{{candidate_name}}`}</code>, <code>{`{{job_title}}`}</code>, dan <code>{`{{company_name}}`}</code>.</p>
            </div>

            <div className="space-y-6">

              {/* Interview Invitation */}
              <div className="p-5 bg-muted/20 border border-border rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-foreground">Undangan Wawancara Video</h4>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Subjek Email</label>
                  <input
                    type="text"
                    value={emailInvSubject}
                    onChange={e => setEmailInvSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Isi Pesan</label>
                  <textarea
                    rows={4}
                    value={emailInvBody}
                    onChange={e => setEmailInvBody(e.target.value)}
                    className="w-full p-4 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Hiring Offer */}
              <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Pemberitahuan Diterima (Hired)</h4>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Subjek Email</label>
                  <input
                    type="text"
                    value={emailHireSubject}
                    onChange={e => setEmailHireSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Isi Pesan</label>
                  <textarea
                    rows={4}
                    value={emailHireBody}
                    onChange={e => setEmailHireBody(e.target.value)}
                    className="w-full p-4 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Rejection */}
              <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">Pemberitahuan Ditolak (Rejected)</h4>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Subjek Email</label>
                  <input
                    type="text"
                    value={emailRejectSubject}
                    onChange={e => setEmailRejectSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Isi Pesan</label>
                  <textarea
                    rows={4}
                    value={emailRejectBody}
                    onChange={e => setEmailRejectBody(e.target.value)}
                    className="w-full p-4 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                  ></textarea>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Menyimpan...' : t.settings.saveSettings}
          </button>
        </div>

      </form>

    </div>
  );
}
