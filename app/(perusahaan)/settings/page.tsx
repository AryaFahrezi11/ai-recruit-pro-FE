'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { fetchAuth } from '@/lib/api/auth';
import { useAppStore } from '@/lib/store/useAppStore';
import { 
  Building2, Sliders, Mail, Save, CheckCircle2, 
  Sparkles, Bot, Upload
} from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'ai_rules' | 'email'>('profile');
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const token = useAppStore(state => state.token);

  // Form States - AI Rules
  const [defaultThreshold, setDefaultThreshold] = useState(80);
  const [autoInviteInterview, setAutoInviteInterview] = useState(true);
  const [autoArchiveRejected, setAutoArchiveRejected] = useState(true);
  
  // Video Weights
  const [weights, setWeights] = useState({
    ability: 20,
    intelligent: 20,
    personality: 20,
    attitude: 20,
    emotionalIntelligence: 20,
  });

  // Form States - Email
  const [emailInvSubject, setEmailInvSubject] = useState('');
  const [emailInvBody, setEmailInvBody] = useState('');
  const [emailHireSubject, setEmailHireSubject] = useState('');

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
        
        // AI Settings
        setDefaultThreshold(data.ai_settings.ai_default_threshold ?? 80);
        setAutoInviteInterview(data.ai_settings.auto_invite_interview ?? true);
        setAutoArchiveRejected(data.ai_settings.auto_archive_rejected ?? true);
        if (data.ai_settings.video_weights_json) {
          try {
            setWeights(JSON.parse(data.ai_settings.video_weights_json));
          } catch (e) {
            console.error("Failed to parse video weights", e);
          }
        }

        // Email Templates
        setEmailInvSubject(data.email_templates.email_invitation_subject || '');
        setEmailInvBody(data.email_templates.email_invitation_body || '');
        setEmailHireSubject(data.email_templates.email_hire_subject || '');
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
        ai_default_threshold: defaultThreshold,
        auto_invite_interview: autoInviteInterview,
        auto_archive_rejected: autoArchiveRejected,
        video_weights_json: JSON.stringify(weights),
        email_invitation_subject: emailInvSubject,
        email_invitation_body: emailInvBody,
        email_hire_subject: emailHireSubject,
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
      const res = await fetch('http://localhost:8000/api/perusahaan/settings/logo', {
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
          { id: 'ai_rules', label: t.settings.aiRulesTab, icon: Sliders },
          { id: 'email', label: t.settings.emailTemplatesTab, icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap -mb-px ${
                isActive 
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
          <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-primary text-primary-foreground font-bold text-3xl flex items-center justify-center border border-border shadow-inner shrink-0 overflow-hidden">
                {logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={`http://localhost:8000${logoUrl}`} alt="Logo Perusahaan" className="w-full h-full object-cover" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border">
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

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-2">Deskripsi Perusahaan</label>
                <textarea 
                  rows={3}
                  value={companyDesc}
                  onChange={(e) => setCompanyDesc(e.target.value)}
                  className="w-full p-4 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: AI AUTOMATION RULES ==================== */}
        {activeTab === 'ai_rules' && (
          <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-8 animate-in fade-in duration-200">
            
            {/* Default Threshold */}
            <div className="p-5 bg-muted/20 border border-border rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    Ambang Batas Default CV Cosine Similarity (PO-FIT)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ambang batas minimal standar yang akan otomatis diterapkan saat membuat lowongan pekerjaan baru.
                  </p>
                </div>
                <span className="text-2xl font-bold text-primary">{defaultThreshold}%</span>
              </div>
              <input 
                type="range"
                min="50"
                max="95"
                step="5"
                value={defaultThreshold}
                onChange={(e) => setDefaultThreshold(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>50% (Longgar)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">80% (Standar AI Recruit Pro)</span>
                <span>95% (Ketat)</span>
              </div>
            </div>

            {/* Automation Toggles */}
            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Bot size={16} className="text-primary" />
                Otomatisasi Alur Workflow AI
              </h3>

              <div className="p-4 bg-muted/30 border border-border rounded-lg flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-foreground">Otomatisasi Undangan Wawancara Video</p>
                  <p className="text-[11px] text-muted-foreground">
                    Otomatis kirim email undangan wawancara video virtual jika kandidat lulus seleksi CV PO-FIT (≥80%).
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={autoInviteInterview}
                  onChange={(e) => setAutoInviteInterview(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="p-4 bg-muted/30 border border-border rounded-lg flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-foreground">Otomatis Arsipkan Kandidat Ditolak</p>
                  <p className="text-[11px] text-muted-foreground">
                    Otomatis pindahkan data kandidat ke halaman Arsip setelah HR memberikan keputusan penolakan.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={autoArchiveRejected}
                  onChange={(e) => setAutoArchiveRejected(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Video Parameter Weights Distribution */}
            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="font-bold text-sm text-foreground">
                Distribusi Bobot 5 Parameter Analisis Video AI
              </h3>
              <p className="text-xs text-muted-foreground">
                Tentukan proporsi penilaian otomatis sistem untuk analisis wawancara video pelamar (Total: 100%).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {[
                  { key: 'ability', label: 'Ability', value: weights.ability },
                  { key: 'intelligent', label: 'Intelligent', value: weights.intelligent },
                  { key: 'personality', label: 'Personality', value: weights.personality },
                  { key: 'attitude', label: 'Attitude', value: weights.attitude },
                  { key: 'emotionalIntelligence', label: 'Emotional Eq.', value: weights.emotionalIntelligence },
                ].map(param => (
                  <div key={param.key} className="p-3 bg-muted/20 border border-border rounded-lg text-center">
                    <p className="text-[11px] font-semibold text-foreground mb-1">{param.label}</p>
                    <span className="text-lg font-bold text-primary">{param.value}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==================== TAB 3: EMAIL TEMPLATES ==================== */}
        {activeTab === 'email' && (
          <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="font-bold text-base text-foreground mb-1">Template Email Otomatis</h3>
              <p className="text-xs text-muted-foreground">Sesuaikan subjek dan pesan email pemberitahuan yang dikirim otomatis ke kandidat.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Subjek Email Undangan Wawancara Video
                </label>
                <input 
                  type="text"
                  value={emailInvSubject}
                  onChange={e => setEmailInvSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Isi Pesan Undangan Wawancara
                </label>
                <textarea 
                  rows={4}
                  value={emailInvBody}
                  onChange={e => setEmailInvBody(e.target.value)}
                  className="w-full p-4 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Subjek Email Penerimaan (Hire)
                </label>
                <input 
                  type="text"
                  value={emailHireSubject}
                  onChange={e => setEmailHireSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
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
