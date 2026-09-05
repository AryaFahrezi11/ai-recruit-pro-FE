'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { fetchAuth } from '@/lib/api/auth';
import { getApiUrl, getMediaUrl } from '@/lib/api';
import { useAppStore } from '@/lib/store/useAppStore';
import {
  Building2, 
  Mail, 
  Save, 
  CheckCircle2, 
  Upload, 
  Video, 
  Calendar, 
  XCircle, 
  Eye, 
  RotateCcw, 
  Send, 
  Sparkles, 
  Info,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TemplateConfig {
  id: 'invitation' | 'interview_user' | 'hire' | 'reject';
  title: string;
  badge: string;
  icon: any;
  subjectKey: string;
  bodyKey: string;
  description: string;
  variables: { tag: string; desc: string; sample: string }[];
}

const DEFAULT_COMPANY_TEMPLATES: Record<string, string> = {
  email_invitation_subject: "[AI Recruit Pro] Undangan Wawancara Video Virtual - {{job_title}}",
  email_invitation_body: `Halo {{candidate_name}},

Selamat! CV Anda telah lolos tahap seleksi awal (CV Screening).

Kami mengundang Anda untuk mengikuti tahapan Wawancara Video AI (Virtual Interview) berdurasi singkat. Silakan masuk ke dashboard status lamaran Anda melalui tautan berikut:
{{interview_link}}

Harap selesaikan perekaman video sebelum batas waktu yang ditentukan.

Salam sukses,
Tim Rekrutmen {{company_name}}`,

  email_interview_user_subject: "[AI Recruit Pro] Undangan Wawancara Lanjutan - {{job_title}} di {{company_name}}",
  email_interview_user_body: `Halo {{candidate_name}},

Selamat! Berdasarkan hasil evaluasi tahapan wawancara video AI sebelumnya, kami mengundang Anda untuk mengikuti tahapan Wawancara Lanjutan bersama Tim User/HR:

Posisi: {{job_title}}
Jadwal: {{jadwal_wawancara}}
Lokasi / Tautan Meeting: {{lokasi_atau_link}}

Instruksi / Catatan:
{{catatan_hr}}

Mohon konfirmasi kesediaan kehadiran Anda dengan membalas pesan email ini.

Salam hormat,
Tim Rekrutmen {{company_name}}`,

  email_hire_subject: "[AI Recruit Pro] Selamat! Anda Diterima di {{company_name}}",
  email_hire_body: `Halo {{candidate_name}},

Kabar gembira! Kami sangat terkesan dengan kualifikasi dan performa Anda selama rangkaian proses seleksi.

Dengan senang hati kami menawarkan Anda posisi {{job_title}} di {{company_name}}.

Tim HR kami akan segera menghubungi Anda kembali mengenai dokumen penawaran resmi (Offering Letter) dan tahapan administrasi onboarding selanjutnya.

Selamat bergabung di tim kami!

Salam hangat,
Tim Manajemen {{company_name}}`,

  email_reject_subject: "[AI Recruit Pro] Update Status Lamaran: {{job_title}}",
  email_reject_body: `Halo {{candidate_name}},

Terima kasih atas waktu, antusiasme, dan ketertarikan Anda untuk melamar posisi {{job_title}} di {{company_name}}.

Setelah melalui pertimbangan yang mendalam, saat ini kami memutuskan untuk belum dapat melanjutkan proses lamaran Anda ke tahapan berikutnya.

Catatan Evaluasi Tim HR:
"{{alasan_penolakan}}"

Kami sangat mengapresiasi profil Anda dan data Anda akan tetap tersimpan di database talenta kami untuk peluang yang relevan di masa mendatang.

Semoga sukses dalam perjalanan karier Anda selanjutnya.

Salam hormat,
Tim Rekrutmen {{company_name}}`
};

const COMPANY_TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: 'invitation',
    title: 'Wawancara Video AI',
    badge: 'Tahap 3 Seleksi',
    icon: Video,
    subjectKey: 'email_invitation_subject',
    bodyKey: 'email_invitation_body',
    description: 'Terkirim otomatis ke pelamar saat CV dinyatakan lolos skrining dan diminta merekam jawaban video wawancara AI.',
    variables: [
      { tag: '{{candidate_name}}', desc: 'Nama lengkap pelamar', sample: 'Ahmad Fauzi' },
      { tag: '{{job_title}}', desc: 'Judul posisi lowongan', sample: 'Frontend Engineer' },
      { tag: '{{company_name}}', desc: 'Nama instansi / perusahaan', sample: 'PT Teknologi Inovasi' },
      { tag: '{{interview_link}}', desc: 'Link ke portal perekaman wawancara', sample: 'http://localhost:3000/applicant/status' }
    ]
  },
  {
    id: 'interview_user',
    title: 'Wawancara Lanjutan / User',
    badge: 'Tahap 5 Akhir',
    icon: Calendar,
    subjectKey: 'email_interview_user_subject',
    bodyKey: 'email_interview_user_body',
    description: 'Terkirim saat HR menjadwalkan sesi interview lanjutan (tatap muka atau Google Meet/Zoom) dengan User/Direksi.',
    variables: [
      { tag: '{{candidate_name}}', desc: 'Nama lengkap pelamar', sample: 'Ahmad Fauzi' },
      { tag: '{{job_title}}', desc: 'Judul posisi lowongan', sample: 'Frontend Engineer' },
      { tag: '{{company_name}}', desc: 'Nama instansi / perusahaan', sample: 'PT Teknologi Inovasi' },
      { tag: '{{jadwal_wawancara}}', desc: 'Hari, tanggal, dan jam wawancara', sample: 'Jumat, 12 September 2026, 14:00 WIB' },
      { tag: '{{lokasi_atau_link}}', desc: 'Tautan Google Meet atau alamat kantor', sample: 'https://meet.google.com/abc-defg-hij' },
      { tag: '{{catatan_hr}}', desc: 'Instruksi khusus atau catatan persiapan', sample: 'Siapkan laptop dan portofolio proyek terbaik Anda.' }
    ]
  },
  {
    id: 'hire',
    title: 'Pemberitahuan Diterima',
    badge: 'Offering Letter',
    icon: CheckCircle2,
    subjectKey: 'email_hire_subject',
    bodyKey: 'email_hire_body',
    description: 'Terkirim saat HR memutuskan untuk menerima kandidat dan memberikan penawaran kerja (Hired).',
    variables: [
      { tag: '{{candidate_name}}', desc: 'Nama lengkap pelamar', sample: 'Ahmad Fauzi' },
      { tag: '{{job_title}}', desc: 'Judul posisi lowongan', sample: 'Frontend Engineer' },
      { tag: '{{company_name}}', desc: 'Nama instansi / perusahaan', sample: 'PT Teknologi Inovasi' }
    ]
  },
  {
    id: 'reject',
    title: 'Pemberitahuan Ditolak',
    badge: 'Rejection Letter',
    icon: XCircle,
    subjectKey: 'email_reject_subject',
    bodyKey: 'email_reject_body',
    description: 'Terkirim saat lamaran kandidat ditolak, dilengkapi dengan catatan evaluasi penolakan yang transparan.',
    variables: [
      { tag: '{{candidate_name}}', desc: 'Nama lengkap pelamar', sample: 'Ahmad Fauzi' },
      { tag: '{{job_title}}', desc: 'Judul posisi lowongan', sample: 'Frontend Engineer' },
      { tag: '{{company_name}}', desc: 'Nama instansi / perusahaan', sample: 'PT Teknologi Inovasi' },
      { tag: '{{alasan_penolakan}}', desc: 'Alasan atau catatan penolakan dari HR', sample: 'Kualifikasi pengalaman teknis belum memenuhi standar minimum posisi ini.' }
    ]
  }
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'email'>('profile');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('invitation');
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Test email modal state
  const [testEmailModal, setTestEmailModal] = useState<boolean>(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>('');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

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

  // Form States - Email Templates
  const [emailTemplates, setEmailTemplates] = useState<Record<string, string>>({
    email_invitation_subject: DEFAULT_COMPANY_TEMPLATES.email_invitation_subject,
    email_invitation_body: DEFAULT_COMPANY_TEMPLATES.email_invitation_body,
    email_interview_user_subject: DEFAULT_COMPANY_TEMPLATES.email_interview_user_subject,
    email_interview_user_body: DEFAULT_COMPANY_TEMPLATES.email_interview_user_body,
    email_hire_subject: DEFAULT_COMPANY_TEMPLATES.email_hire_subject,
    email_hire_body: DEFAULT_COMPANY_TEMPLATES.email_hire_body,
    email_reject_subject: DEFAULT_COMPANY_TEMPLATES.email_reject_subject,
    email_reject_body: DEFAULT_COMPANY_TEMPLATES.email_reject_body,
  });

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAuth('/api/perusahaan/settings', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();

        // Profile
        setCompanyName(data.profile?.nama_perusahaan || '');
        setIndustry(data.profile?.industri || '');
        setCompanySize(data.profile?.ukuran || '100 - 500 Employees');
        setWebsite(data.profile?.website_url || '');
        setCompanyDesc(data.profile?.deskripsi || '');
        setLogoUrl(data.profile?.logo_url || '');
        setAlamat(data.profile?.alamat || '');
        setKota(data.profile?.kota || '');
        setProvinsi(data.profile?.provinsi || '');
        setNoTelepon(data.profile?.no_telepon || '');
        setTahunBerdiri(data.profile?.tahun_berdiri || '');
        setHrName(data.profile?.hr_name || '');
        setHrWhatsapp(data.profile?.hr_whatsapp || '');
        setHrPosition(data.profile?.hr_position || '');

        // Email Templates
        if (data.email_templates) {
          setEmailTemplates(prev => ({
            ...prev,
            email_invitation_subject: data.email_templates.email_invitation_subject || DEFAULT_COMPANY_TEMPLATES.email_invitation_subject,
            email_invitation_body: data.email_templates.email_invitation_body || DEFAULT_COMPANY_TEMPLATES.email_invitation_body,
            email_interview_user_subject: data.email_templates.email_interview_user_subject || DEFAULT_COMPANY_TEMPLATES.email_interview_user_subject,
            email_interview_user_body: data.email_templates.email_interview_user_body || DEFAULT_COMPANY_TEMPLATES.email_interview_user_body,
            email_hire_subject: data.email_templates.email_hire_subject || DEFAULT_COMPANY_TEMPLATES.email_hire_subject,
            email_hire_body: data.email_templates.email_hire_body || DEFAULT_COMPANY_TEMPLATES.email_hire_body,
            email_reject_subject: data.email_templates.email_reject_subject || DEFAULT_COMPANY_TEMPLATES.email_reject_subject,
            email_reject_body: data.email_templates.email_reject_body || DEFAULT_COMPANY_TEMPLATES.email_reject_body,
          }));
        }
      }
    } catch (error) {
      console.error("Gagal memuat pengaturan", error);
      toast.error('Gagal memuat pengaturan perusahaan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleTemplateChange = (key: string, val: string) => {
    setEmailTemplates(prev => ({ ...prev, [key]: val }));
  };

  const handleResetTemplate = (tpl: TemplateConfig) => {
    if (confirm(`Apakah Anda yakin ingin mengembalikan template "${tpl.title}" ke susunan pesan standar?`)) {
      setEmailTemplates(prev => ({
        ...prev,
        [tpl.subjectKey]: DEFAULT_COMPANY_TEMPLATES[tpl.subjectKey],
        [tpl.bodyKey]: DEFAULT_COMPANY_TEMPLATES[tpl.bodyKey]
      }));
      toast.success(`Template ${tpl.title} berhasil dikembalikan ke default`);
    }
  };

  const handleInsertVariable = (tag: string, target: 'subject' | 'body', tpl: TemplateConfig) => {
    const key = target === 'subject' ? tpl.subjectKey : tpl.bodyKey;
    const current = emailTemplates[key] || '';
    handleTemplateChange(key, current + (current.endsWith(' ') || current === '' ? '' : ' ') + tag);
    navigator.clipboard?.writeText(tag);
    toast.success(`Variabel ${tag} ditambahkan`, { duration: 1500 });
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      toast.error('Masukkan alamat email penerima yang valid!');
      return;
    }

    const currentTpl = COMPANY_TEMPLATE_CONFIGS.find(t => t.id === selectedTemplateId) || COMPANY_TEMPLATE_CONFIGS[0];
    let subject = emailTemplates[currentTpl.subjectKey] || DEFAULT_COMPANY_TEMPLATES[currentTpl.subjectKey];
    let body = emailTemplates[currentTpl.bodyKey] || DEFAULT_COMPANY_TEMPLATES[currentTpl.bodyKey];

    // Mock replace variables for test send
    currentTpl.variables.forEach(v => {
      subject = subject.replaceAll(v.tag, v.sample);
      body = body.replaceAll(v.tag, v.sample);
    });

    setIsSendingTest(true);
    try {
      const res = await fetchAuth('/api/perusahaan/settings/test-email', {
        method: 'POST',
        body: JSON.stringify({
          recipient: testEmailRecipient,
          subject: `[TEST PERUSAHAAN] ${subject}`,
          body: body
        })
      });

      const resData = await res.json();
      if (res.ok) {
        if (resData.status === 'success') {
          toast.success(resData.message || 'Email uji coba berhasil dikirim!');
          setTestEmailModal(false);
        } else {
          toast(resData.message || 'Pemberitahuan pengiriman', { icon: '⚠️' });
        }
      } else {
        toast.error(resData.detail || 'Gagal mengirim email uji coba');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan jaringan saat mengirim email');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        ...emailTemplates
      };

      const res = await fetchAuth('/api/perusahaan/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(t.settings?.settingsSaved || 'Pengaturan perusahaan dan template email berhasil disimpan!');
      } else {
        toast.error("Gagal menyimpan pengaturan.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diperbolehkan');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetchAuth('/api/perusahaan/settings/logo', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setLogoUrl(data.logo_url);
        toast.success('Logo perusahaan berhasil diperbarui');
      } else {
        toast.error('Gagal mengunggah logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Terjadi kesalahan saat mengunggah');
    }
  };

  const activeTplConfig = COMPANY_TEMPLATE_CONFIGS.find(t => t.id === selectedTemplateId) || COMPANY_TEMPLATE_CONFIGS[0];
  
  // Render simulated email preview
  const getRenderedPreview = (tpl: TemplateConfig) => {
    let subject = emailTemplates[tpl.subjectKey] || DEFAULT_COMPANY_TEMPLATES[tpl.subjectKey] || '';
    let body = emailTemplates[tpl.bodyKey] || DEFAULT_COMPANY_TEMPLATES[tpl.bodyKey] || '';

    tpl.variables.forEach(v => {
      subject = subject.replaceAll(v.tag, v.sample);
      body = body.replaceAll(v.tag, v.sample);
    });

    return { subject, body };
  };

  const renderedPreview = getRenderedPreview(activeTplConfig);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans antialiased pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {t.settings?.title || 'Pengaturan Perusahaan'}
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            {t.settings?.subtitle || 'Kelola profil resmi perusahaan dan sesuaikan template pesan email notifikasi untuk kandidat pelamar.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {t.settings?.saveSettings || 'Simpan Semua Pengaturan'}
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-xs border-b-2 transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 size={16} />
          {t.settings?.companyProfileTab || 'Profil Perusahaan'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-xs border-b-2 transition-colors cursor-pointer ${
            activeTab === 'email'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mail size={16} />
          {t.settings?.emailTemplatesTab || 'Template Email Notifikasi'}
          <span className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-extrabold">
            4 Template
          </span>
        </button>
      </div>

      {/* ==================== TAB 1: PROFILE ==================== */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-xs space-y-6">
            <h3 className="font-extrabold text-base text-foreground">Informasi Dasar Perusahaan</h3>

            {/* Logo Upload */}
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-2xl bg-muted/40 border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                {logoUrl ? (
                  <img src={getMediaUrl(logoUrl)} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={32} className="text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-xs rounded-xl border border-border transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Upload size={14} />
                    Unggah Logo
                  </button>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="text-xs text-rose-500 hover:underline font-medium"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">Format JPG, PNG atau WebP. Maksimal 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-border">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Nama Perusahaan</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Bidang Industri</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Teknologi Informasi, Keuangan"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Ukuran Perusahaan</label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                >
                  <option value="1 - 10 Employees">1 - 10 Karyawan</option>
                  <option value="11 - 50 Employees">11 - 50 Karyawan</option>
                  <option value="51 - 200 Employees">51 - 200 Karyawan</option>
                  <option value="201 - 500 Employees">201 - 500 Karyawan</option>
                  <option value="500+ Employees">Lebih dari 500 Karyawan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Tahun Berdiri</label>
                <input
                  type="number"
                  value={tahunBerdiri}
                  onChange={(e) => setTahunBerdiri(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="e.g. 2018"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Website Perusahaan</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Nomor Telepon Resmi Kantor</label>
                <input
                  type="tel"
                  value={noTelepon}
                  onChange={(e) => setNoTelepon(e.target.value)}
                  placeholder="+62 21 555 1234"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-1.5">Deskripsi Perusahaan</label>
                <textarea
                  rows={3}
                  value={companyDesc}
                  onChange={(e) => setCompanyDesc(e.target.value)}
                  placeholder="Jelaskan visi, misi, dan profil singkat perusahaan Anda..."
                  className="w-full p-4 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none resize-none font-medium"
                />
              </div>

              {/* ALAMAT */}
              <div className="md:col-span-2 pt-4 border-t border-border">
                <h4 className="text-sm font-bold text-foreground mb-4">Alamat Kantor Pusat</h4>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-foreground mb-1.5">Alamat Lengkap</label>
                <input
                  type="text"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Jl. Sudirman No. 123, Gedung Plaza Lantai 5"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Kota / Kabupaten</label>
                <input
                  type="text"
                  value={kota}
                  onChange={(e) => setKota(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Provinsi</label>
                <input
                  type="text"
                  value={provinsi}
                  onChange={(e) => setProvinsi(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>

              {/* HR CONTACT SECTION */}
              <div className="md:col-span-2 pt-4 border-t border-border">
                <h4 className="text-sm font-bold text-foreground mb-1">Kontak Penanggung Jawab HR</h4>
                <p className="text-xs text-muted-foreground mb-4">Informasi perwakilan tim HR untuk koordinasi operasional.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Nama HR / Rekruter</label>
                <input
                  type="text"
                  value={hrName}
                  onChange={(e) => setHrName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Jabatan HR</label>
                <input
                  type="text"
                  value={hrPosition}
                  onChange={(e) => setHrPosition(e.target.value)}
                  placeholder="e.g. HR Manager / Talent Acquisition"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Nomor WhatsApp HR</label>
                <input
                  type="text"
                  value={hrWhatsapp}
                  onChange={(e) => setHrWhatsapp(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ==================== TAB 2: EMAIL TEMPLATES ==================== */}
      {activeTab === 'email' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                  <Mail size={18} /> Template Pesan Email Notifikasi Kandidat
                </h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Sesuaikan kata-kata resmi yang otomatis dikirimkan ke email kandidat saat status tahapan lamarannya diperbarui.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    showPreview 
                      ? 'bg-foreground text-background' 
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Eye size={14} /> {showPreview ? 'Sembunyikan Preview' : 'Tampilkan Preview'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setTestEmailRecipient('');
                    setTestEmailModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Send size={13} /> Tes Kirim Email
                </button>
              </div>
            </div>

            {/* Template Selector Pills */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-border">
              {COMPANY_TEMPLATE_CONFIGS.map(tpl => {
                const Icon = tpl.icon;
                const isActive = selectedTemplateId === tpl.id;
                return (
                  <button
                    type="button"
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-foreground text-background shadow-2xs' 
                        : 'bg-muted/40 text-muted-foreground hover:text-foreground border border-border'
                    }`}
                  >
                    <Icon size={14} />
                    {tpl.title}
                  </button>
                );
              })}
            </div>

            {/* Template Form & Live Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Editor */}
              <div className={showPreview ? 'lg:col-span-7 space-y-5' : 'lg:col-span-12 space-y-5'}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-muted text-foreground">
                      {activeTplConfig.badge}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      {activeTplConfig.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResetTemplate(activeTplConfig)}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors cursor-pointer"
                    title="Kembalikan template ini ke susunan teks bawaan sistem"
                  >
                    <RotateCcw size={13} /> Reset Default
                  </button>
                </div>

                {/* Variable Chips */}
                <div className="p-3.5 bg-muted/30 border border-border rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-500" /> Variabel Dinamis Tersedia:
                    </span>
                    <span className="text-[10px] text-muted-foreground">Klik variabel untuk menambahkan</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeTplConfig.variables.map(v => (
                      <div 
                        key={v.tag}
                        className="group flex items-center bg-card border border-border hover:border-primary/50 rounded-lg p-1 transition-all shadow-2xs"
                      >
                        <button
                          type="button"
                          onClick={() => handleInsertVariable(v.tag, 'body', activeTplConfig)}
                          className="px-2 py-0.5 font-mono text-[11px] font-bold text-primary hover:underline cursor-pointer"
                          title={`${v.desc} (Contoh: ${v.sample})`}
                        >
                          {v.tag}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertVariable(v.tag, 'subject', activeTplConfig)}
                          className="px-1.5 py-0.5 text-[9px] font-extrabold text-muted-foreground hover:text-foreground border-l border-border cursor-pointer"
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
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Subjek Email (Subject)
                  </label>
                  <input 
                    type="text" 
                    value={emailTemplates[activeTplConfig.subjectKey] || ''}
                    onChange={(e) => handleTemplateChange(activeTplConfig.subjectKey, e.target.value)}
                    placeholder="Masukkan judul subjek email..."
                    className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                  />
                </div>

                {/* Body Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-foreground">
                      Isi Konten Pesan Email (Body Text)
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      Format Teks Bersih (Gunakan baris baru untuk paragraf)
                    </span>
                  </div>
                  <textarea 
                    value={emailTemplates[activeTplConfig.bodyKey] || ''}
                    onChange={(e) => handleTemplateChange(activeTplConfig.bodyKey, e.target.value)}
                    rows={12}
                    placeholder="Tulis format template pesan email di sini..."
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-mono leading-relaxed resize-y"
                  />
                </div>
              </div>

              {/* Right Column: Live Email Preview */}
              {showPreview && (
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                      <Eye size={14} /> Live Email Preview
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Data Simulasi
                    </span>
                  </div>

                  {/* Mail Mock Window */}
                  <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                    {/* Mail Window Header */}
                    <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="ml-2 text-[10px] font-mono text-muted-foreground truncate">
                        Preview: {companyName || 'Perusahaan Anda'}
                      </span>
                    </div>

                    {/* Mail Meta */}
                    <div className="p-4 bg-muted/20 border-b border-border text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-muted-foreground font-bold w-14 shrink-0">Dari:</span>
                        <span className="text-foreground font-semibold truncate">
                          {companyName || 'Perusahaan Anda'} &lt;noreply@airecruitpro.com&gt;
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-muted-foreground font-bold w-14 shrink-0">Kepada:</span>
                        <span className="text-foreground font-mono truncate">
                          ahmad.fauzi@kandidat.com
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-[11px] pt-1">
                        <span className="text-muted-foreground font-bold w-14 shrink-0">Subjek:</span>
                        <span className="text-foreground font-extrabold break-words">
                          {renderedPreview.subject || '(Tanpa Subjek)'}
                        </span>
                      </div>
                    </div>

                    {/* Mail Body Preview */}
                    <div className="p-5 bg-card min-h-[280px] text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {renderedPreview.body || '(Isi pesan kosong)'}
                    </div>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-xl border border-border text-[11px] text-muted-foreground leading-normal">
                    Variabel seperti <code className="text-primary font-mono font-bold">{"{{candidate_name}}"}</code> dan <code className="text-primary font-mono font-bold">{"{{job_title}}"}</code> akan otomatis digantikan dengan data asli saat email dikirimkan ke pelamar.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {testEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Send size={16} /> Uji Coba Pengiriman Email
              </h3>
              <button 
                onClick={() => setTestEmailModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Kirimkan email uji coba menggunakan template <strong>{activeTplConfig.title}</strong> ke alamat email Anda untuk melihat bagaimana tampilannya di inbox nyata.
            </p>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Alamat Email Penerima
              </label>
              <input 
                type="email" 
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                placeholder="email.anda@perusahaan.com"
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none font-medium"
              />
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border text-[11px] text-muted-foreground">
              <span className="font-bold">Subjek:</span> [TEST PERUSAHAAN] {renderedPreview.subject}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTestEmailModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-muted hover:bg-muted/80 text-foreground cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
