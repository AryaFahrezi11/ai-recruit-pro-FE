'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Server, 
  Globe, 
  Mail, 
  ShieldAlert, 
  FileText, 
  RotateCcw, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  KeyRound, 
  Send, 
  Copy, 
  Sparkles,
  Info
} from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';

const DEFAULT_TEMPLATES: Record<string, string> = {
  email_tpl_otp_subject: "Kode OTP Verifikasi - AI Recruit Pro",
  email_tpl_otp_body: `Halo {nama_penerima},

Kode OTP verifikasi akun Anda adalah:

{otp_code}

Kode ini berlaku selama {kadaluarsa_menit} menit. Harap jangan memberikan kode ini kepada siapapun demi keamanan akun Anda.

Salam hormat,
Tim AI Recruit Pro`,

  email_tpl_company_approved_subject: "Selamat! Pengajuan Akun Perusahaan {nama_perusahaan} Telah Terverifikasi",
  email_tpl_company_approved_body: `Halo Tim {nama_perusahaan},

Kabar baik! Dokumen legalitas dan data profil perusahaan Anda telah diverifikasi dan disetujui oleh tim kurator AI Recruit Pro.

Akun perusahaan Anda kini berstatus Resmi & Terverifikasi (Verified). Anda sudah dapat membuat lowongan kerja baru, mengelola pelamar, dan memanfaatkan fitur AI ATS.

Silakan login ke portal dashboard perusahaan Anda:
{login_url}

Terima kasih telah mempercayakan kebutuhan rekrutmen Anda kepada AI Recruit Pro!

Salam sukses,
Tim AI Recruit Pro`,

  email_tpl_company_rejected_subject: "Pemberitahuan Status Verifikasi Akun Perusahaan {nama_perusahaan}",
  email_tpl_company_rejected_body: `Halo Tim {nama_perusahaan},

Terima kasih telah mendaftar dan mengajukan verifikasi profil perusahaan di platform AI Recruit Pro.

Setelah dilakukan peninjauan dokumen, saat ini pengajuan verifikasi perusahaan Anda belum dapat kami setujui dengan catatan penolakan berikut:
"{alasan_penolakan}"

Anda dapat memperbarui data atau mengunggah ulang dokumen legalitas yang sesuai dengan masuk kembali ke akun Anda melalui tautan berikut:
{revisi_url}

Jika ada kendala atau pertanyaan lebih lanjut, silakan hubungi tim dukungan kami.

Salam hormat,
Tim Verifikasi AI Recruit Pro`
};

interface TemplateConfig {
  id: string;
  title: string;
  badge: string;
  icon: any;
  subjectKey: string;
  bodyKey: string;
  description: string;
  variables: { tag: string; desc: string; sample: string }[];
}

const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: 'otp',
    title: 'Kode OTP Verifikasi Akun',
    badge: 'Autentikasi',
    icon: KeyRound,
    subjectKey: 'email_tpl_otp_subject',
    bodyKey: 'email_tpl_otp_body',
    description: 'Dikirim saat pengguna mendaftar atau meminta kode OTP baru untuk verifikasi nomor/email.',
    variables: [
      { tag: '{otp_code}', desc: '6 digit kode angka OTP acak', sample: '849201' },
      { tag: '{nama_penerima}', desc: 'Nama atau username penerima email', sample: 'John Doe' },
      { tag: '{kadaluarsa_menit}', desc: 'Durasi menit sebelum kode kedaluwarsa', sample: '10' }
    ]
  },
  {
    id: 'company_approved',
    title: 'Verifikasi Perusahaan Disetujui',
    badge: 'Legalitas Disetujui',
    icon: CheckCircle2,
    subjectKey: 'email_tpl_company_approved_subject',
    bodyKey: 'email_tpl_company_approved_body',
    description: 'Dikirim otomatis saat Admin menyetujui (verify) profil perusahaan dan dokumen legalitas (NIB/NPWP).',
    variables: [
      { tag: '{nama_perusahaan}', desc: 'Nama instansi/perusahaan', sample: 'PT Inovasi Teknologi Bangsa' },
      { tag: '{email_perusahaan}', desc: 'Alamat email akun perusahaan', sample: 'hr@inovasiteknologi.co.id' },
      { tag: '{login_url}', desc: 'Tautan ke halaman login dashboard', sample: 'http://localhost:3000/login' }
    ]
  },
  {
    id: 'company_rejected',
    title: 'Verifikasi Perusahaan Ditolak',
    badge: 'Perlu Revisi Dokumen',
    icon: XCircle,
    subjectKey: 'email_tpl_company_rejected_subject',
    bodyKey: 'email_tpl_company_rejected_body',
    description: 'Dikirim otomatis saat Admin menolak dokumen legalitas dengan menyertakan alasan spesifik penolakan.',
    variables: [
      { tag: '{nama_perusahaan}', desc: 'Nama instansi/perusahaan', sample: 'PT Maju Terus Semesta' },
      { tag: '{alasan_penolakan}', desc: 'Catatan/alasan penolakan yang ditulis Admin', sample: 'Nomor NIB tidak valid di OSS dan dokumen KTP penanggung jawab buram.' },
      { tag: '{revisi_url}', desc: 'Tautan langsung ke form perbaikan data', sample: 'http://localhost:3000/login' }
    ]
  }
];

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'templates' | 'system'>('general');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('otp');
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Test email modal state
  const [testEmailModal, setTestEmailModal] = useState<boolean>(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>('');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  const [settings, setSettings] = useState<Record<string, any>>({
    maintenance_mode: false,
    seo_title: '',
    seo_description: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '',
    ...DEFAULT_TEMPLATES
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAuth('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ 
          ...prev, 
          ...DEFAULT_TEMPLATES,
          ...data 
        }));
      }
    } catch (e) {
      toast.error('Gagal memuat pengaturan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetchAuth('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast.success('Pengaturan sistem dan template email berhasil disimpan!');
      } else {
        toast.error('Gagal menyimpan pengaturan');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleResetTemplate = (tpl: TemplateConfig) => {
    if (confirm(`Apakah Anda yakin ingin mengembalikan template "${tpl.title}" ke standar default sistem?`)) {
      setSettings(prev => ({
        ...prev,
        [tpl.subjectKey]: DEFAULT_TEMPLATES[tpl.subjectKey],
        [tpl.bodyKey]: DEFAULT_TEMPLATES[tpl.bodyKey]
      }));
      toast.success(`Template ${tpl.title} dikembalikan ke default`);
    }
  };

  const handleInsertVariable = (variableTag: string, targetField: 'subject' | 'body', tpl: TemplateConfig) => {
    const key = targetField === 'subject' ? tpl.subjectKey : tpl.bodyKey;
    const currentVal = settings[key] || '';
    
    // Copy to clipboard as convenient helper
    navigator.clipboard?.writeText(variableTag);
    
    handleChange(key, currentVal + (currentVal.endsWith(' ') || currentVal === '' ? '' : ' ') + variableTag);
    toast.success(`Variabel ${variableTag} disalin dan ditambahkan`, { duration: 1500 });
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      toast.error('Masukkan alamat email penerima yang valid!');
      return;
    }

    const currentTpl = TEMPLATE_CONFIGS.find(t => t.id === selectedTemplateId) || TEMPLATE_CONFIGS[0];
    let subject = settings[currentTpl.subjectKey] || DEFAULT_TEMPLATES[currentTpl.subjectKey];
    let body = settings[currentTpl.bodyKey] || DEFAULT_TEMPLATES[currentTpl.bodyKey];

    // Mock replace variables for test send
    currentTpl.variables.forEach(v => {
      subject = subject.replaceAll(v.tag, v.sample);
      body = body.replaceAll(v.tag, v.sample);
    });

    setIsSendingTest(true);
    try {
      const res = await fetchAuth('/api/admin/settings/test-email', {
        method: 'POST',
        body: JSON.stringify({
          recipient: testEmailRecipient,
          subject: `[TEST] ${subject}`,
          body: body
        })
      });

      const resData = await res.json();
      if (res.ok) {
        if (resData.status === 'success') {
          toast.success(resData.message || 'Email uji coba berhasil dikirim!');
          setTestEmailModal(false);
        } else {
          toast(resData.message || 'Peringatan pengiriman email', { icon: '⚠️' });
        }
      } else {
        toast.error(resData.detail || 'Gagal mengirim email uji coba');
      }
    } catch (err) {
      toast.error('Gagal terhubung ke endpoint server pengiriman email');
    } finally {
      setIsSendingTest(false);
    }
  };

  // Render simulated email preview
  const getRenderedPreview = (tpl: TemplateConfig) => {
    let subject = settings[tpl.subjectKey] || DEFAULT_TEMPLATES[tpl.subjectKey] || '';
    let body = settings[tpl.bodyKey] || DEFAULT_TEMPLATES[tpl.bodyKey] || '';

    tpl.variables.forEach(v => {
      subject = subject.replaceAll(v.tag, v.sample);
      body = body.replaceAll(v.tag, v.sample);
    });

    return { subject, body };
  };

  const activeTplConfig = TEMPLATE_CONFIGS.find(t => t.id === selectedTemplateId) || TEMPLATE_CONFIGS[0];
  const renderedPreview = getRenderedPreview(activeTplConfig);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans antialiased max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Settings className="text-black dark:text-white" size={24} /> Pengaturan Sistem
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
            Konfigurasi platform, integrasi SMTP, dan kustomisasi template email notifikasi sistem.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Simpan Semua Pengaturan
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'general' 
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Globe size={16} /> Umum & SEO
          </button>
          
          <button
            onClick={() => setActiveTab('email')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'email' 
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Mail size={16} /> Server SMTP
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'templates' 
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText size={16} /> Template Email
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
              activeTab === 'templates' 
                ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' 
                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
            }`}>
              3 Template
            </span>
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'system' 
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Server size={16} /> Maintenance Mode
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-xs border border-slate-200 dark:border-slate-800">
          
          {/* 1. GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Pengaturan Umum & SEO</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Aplikasi (SEO Title)</label>
                    <input 
                      type="text" 
                      value={settings.seo_title || ''}
                      onChange={(e) => handleChange('seo_title', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Meta (SEO Description)</label>
                    <textarea 
                      value={settings.seo_description || ''}
                      onChange={(e) => handleChange('seo_description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none resize-none font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. EMAIL SMTP TAB */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Konfigurasi SMTP Email</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Server SMTP yang digunakan untuk mengirim kode OTP dan notifikasi perusahaan.</p>
                  </div>
                  <button
                    onClick={() => {
                      setTestEmailRecipient(settings.smtp_from || '');
                      setTestEmailModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer self-start"
                  >
                    <Send size={14} /> Uji Coba Kirim Email
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">SMTP Host</label>
                    <input 
                      type="text" 
                      value={settings.smtp_host || ''}
                      onChange={(e) => handleChange('smtp_host', e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">SMTP Port</label>
                    <input 
                      type="text" 
                      value={settings.smtp_port || '587'}
                      onChange={(e) => handleChange('smtp_port', e.target.value)}
                      placeholder="587"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Pengirim (Sender From)</label>
                    <input 
                      type="email" 
                      value={settings.smtp_from || ''}
                      onChange={(e) => handleChange('smtp_from', e.target.value)}
                      placeholder="noreply@airecruitpro.com"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">SMTP Username</label>
                    <input 
                      type="text" 
                      value={settings.smtp_user || ''}
                      onChange={(e) => handleChange('smtp_user', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">SMTP Password / App Password</label>
                    <input 
                      type="password" 
                      value={settings.smtp_pass || ''}
                      onChange={(e) => handleChange('smtp_pass', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                  <Info size={18} className="text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Untuk Gmail, gunakan <strong>App Password (Sandi Aplikasi)</strong> 16 karakter, bukan password akun Google biasa. Pastikan juga 2-Factor Authentication pada akun Google pengirim telah aktif.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. EMAIL TEMPLATES TAB */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText size={18} /> Kustomisasi Template Pesan Email
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Atur susunan subjek dan isi pesan email yang otomatis terkirim untuk OTP pendaftaran, konfirmasi verifikasi, atau penolakan akun perusahaan.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        showPreview 
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-black' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Eye size={14} /> {showPreview ? 'Sembunyikan Preview' : 'Tampilkan Preview'}
                    </button>
                    
                    <button
                      onClick={() => {
                        setTestEmailRecipient(settings.smtp_from || '');
                        setTestEmailModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <Send size={13} /> Tes Kirim
                    </button>
                  </div>
                </div>

                {/* Sub Template Pills */}
                <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 mb-6">
                  {TEMPLATE_CONFIGS.map(tpl => {
                    const Icon = tpl.icon;
                    const isActive = selectedTemplateId === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-xs' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Icon size={14} />
                        {tpl.title}
                      </button>
                    );
                  })}
                </div>

                {/* Template Detail Form */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Form Editor */}
                  <div className={showPreview ? 'lg:col-span-7 space-y-5' : 'lg:col-span-12 space-y-5'}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {activeTplConfig.badge}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          {activeTplConfig.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleResetTemplate(activeTplConfig)}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors cursor-pointer"
                        title="Kembalikan template ini ke susunan teks bawaan sistem"
                      >
                        <RotateCcw size={13} /> Reset Default
                      </button>
                    </div>

                    {/* Dynamic Variable Chips */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-amber-500" /> Variabel Dinamis Tersedia:
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Klik variabel untuk menambahkan</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeTplConfig.variables.map(v => (
                          <div 
                            key={v.tag}
                            className="group flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 rounded-lg p-1 transition-all shadow-2xs"
                          >
                            <button
                              type="button"
                              onClick={() => handleInsertVariable(v.tag, 'body', activeTplConfig)}
                              className="px-2 py-0.5 font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                              title={`${v.desc} (Contoh: ${v.sample})`}
                            >
                              {v.tag}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInsertVariable(v.tag, 'subject', activeTplConfig)}
                              className="px-1.5 py-0.5 text-[9px] font-extrabold text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border-l border-slate-200 dark:border-slate-800 cursor-pointer"
                              title="Masukkan ke Subjek"
                            >
                              +Subjek
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subject Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Subjek Email (Subject)
                      </label>
                      <input 
                        type="text" 
                        value={settings[activeTplConfig.subjectKey] || ''}
                        onChange={(e) => handleChange(activeTplConfig.subjectKey, e.target.value)}
                        placeholder="Masukkan judul subjek email..."
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-medium"
                      />
                    </div>

                    {/* Body Textarea */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Isi Konten Pesan Email (Body Text)
                        </label>
                        <span className="text-[10px] text-slate-400">
                          Format Plain Text (Gunakan baris baru untuk paragraf)
                        </span>
                      </div>
                      <textarea 
                        value={settings[activeTplConfig.bodyKey] || ''}
                        onChange={(e) => handleChange(activeTplConfig.bodyKey, e.target.value)}
                        rows={11}
                        placeholder="Tulis format template pesan email di sini..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-mono leading-relaxed resize-y"
                      />
                    </div>
                  </div>

                  {/* Right Column: Live Email Mock Preview */}
                  {showPreview && (
                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Eye size={14} /> Live Email Preview
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          Data Simulasi
                        </span>
                      </div>

                      {/* Mock Mail Window */}
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-950 overflow-hidden shadow-xs">
                        {/* Mail Window Header */}
                        <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <span className="ml-2 text-[10px] font-mono text-slate-400 truncate">
                            Preview: {settings.smtp_from || 'noreply@airecruitpro.com'}
                          </span>
                        </div>

                        {/* Mail Meta Header */}
                        <div className="p-4 bg-white/60 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-xs space-y-1.5">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-slate-400 font-bold w-14 shrink-0">Dari:</span>
                            <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                              AI Recruit Pro &lt;{settings.smtp_from || 'noreply@airecruitpro.com'}&gt;
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-slate-400 font-bold w-14 shrink-0">Kepada:</span>
                            <span className="text-slate-800 dark:text-slate-200 font-mono truncate">
                              {selectedTemplateId === 'otp' ? 'user@example.com' : 'hr@perusahaan-tujuan.com'}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 text-[11px] pt-1">
                            <span className="text-slate-400 font-bold w-14 shrink-0">Subjek:</span>
                            <span className="text-slate-900 dark:text-white font-extrabold break-words">
                              {renderedPreview.subject || '(Tanpa Subjek)'}
                            </span>
                          </div>
                        </div>

                        {/* Mail Body Preview */}
                        <div className="p-5 bg-white dark:bg-slate-900 min-h-[260px] text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                          {renderedPreview.body || '(Isi pesan kosong)'}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-100/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                        Nilai variabel seperti <code className="text-blue-600 dark:text-blue-400 font-mono font-bold">{"{nama_perusahaan}"}</code> di atas secara otomatis diisi dengan data asli perusahaan terkait saat sistem mengirimkan notifikasi.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. SYSTEM / MAINTENANCE TAB */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Mode Perbaikan (Maintenance)</h2>
                
                <div className={`p-6 rounded-2xl border transition-all flex items-start gap-4 ${settings.maintenance_mode ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'}`}>
                  <div className="p-3 rounded-xl shrink-0 bg-slate-200 dark:bg-slate-700 text-black dark:text-white">
                    <ShieldAlert size={20} className="text-black dark:text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {settings.maintenance_mode ? 'Maintenance Mode Aktif' : 'Maintenance Mode Nonaktif'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 font-medium leading-relaxed">
                      Saat diaktifkan, seluruh platform tidak akan dapat diakses oleh pelamar maupun perusahaan. Hanya admin yang bisa masuk ke dashboard. Gunakan fitur ini saat Anda melakukan update sistem besar-besaran.
                    </p>
                    <button
                      onClick={() => handleChange('maintenance_mode', !settings.maintenance_mode)}
                      className="px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-xs bg-black hover:bg-slate-800 text-white cursor-pointer"
                    >
                      {settings.maintenance_mode ? 'Matikan Maintenance Mode' : 'Aktifkan Maintenance Mode'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Action */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Simpan Semua Pengaturan
            </button>
          </div>

        </div>
      </div>

      {/* Test Email Modal */}
      {testEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Send size={16} /> Uji Coba Pengiriman Email
              </h3>
              <button 
                onClick={() => setTestEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Kirimkan email uji coba menggunakan template <strong>{activeTplConfig.title}</strong> dan konfigurasi SMTP saat ini ke alamat email Anda.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email Penerima
              </label>
              <input 
                type="email" 
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                placeholder="nama.anda@gmail.com"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-medium"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold">Subjek:</span> [TEST] {renderedPreview.subject}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTestEmailModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-black hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSendingTest ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
