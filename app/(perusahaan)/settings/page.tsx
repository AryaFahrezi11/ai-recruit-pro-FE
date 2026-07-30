'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Building2, Sliders, Mail, Users, Save, CheckCircle2, 
  Sparkles, Bot, ShieldCheck, Globe, Upload, Lock, Check
} from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'ai_rules' | 'email' | 'team'>('profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form States - Profile
  const [companyName, setCompanyName] = useState('RecruitPro Tech Solutions');
  const [industry, setIndustry] = useState('Technology & Information System');
  const [companySize, setCompanySize] = useState('100 - 500 Employees');
  const [website, setWebsite] = useState('https://recruitpro.ai');
  const [companyDesc, setCompanyDesc] = useState(
    'Perusahaan teknologi terkemuka yang berfokus pada pengembangan sistem manajemen talenta cerdas dan rekrutmen berbasis AI.'
  );

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

  // Team Access State
  const [teamMembers, setTeamMembers] = useState([
    { name: 'Arya Fahrezi', email: 'arya.hr@company.com', role: 'Super Admin HR', avatar: 'AF' },
    { name: 'Budi Rahardjo', email: 'budi.recruiter@company.com', role: 'HR Evaluator', avatar: 'BR' },
    { name: 'Siti Aminah', email: 'siti.ta@company.com', role: 'Talent Acquisition Specialist', avatar: 'SA' },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(t.settings.settingsSaved);
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
        <h1 className="text-2xl font-bold text-foreground mb-1">{t.settings.title}</h1>
        <p className="text-sm text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border gap-2 overflow-x-auto custom-scrollbar">
        {[
          { id: 'profile', label: t.settings.companyProfileTab, icon: Building2 },
          { id: 'ai_rules', label: t.settings.aiRulesTab, icon: Sliders },
          { id: 'email', label: t.settings.emailTemplatesTab, icon: Mail },
          { id: 'team', label: t.settings.teamTab, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
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
              <div className="w-20 h-20 rounded-xl bg-primary text-primary-foreground font-bold text-3xl flex items-center justify-center border border-border shadow-inner shrink-0">
                RP
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">{companyName}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Logo Perusahaan (Digunakan pada header portal pelamar)</p>
                <button type="button" className="mt-2 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5">
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
                  { key: 'ability', label: 'Ability' },
                  { key: 'intelligent', label: 'Intelligent' },
                  { key: 'personality', label: 'Personality' },
                  { key: 'attitude', label: 'Attitude' },
                  { key: 'emotionalIntelligence', label: 'Emotional Eq.' },
                ].map(param => (
                  <div key={param.key} className="p-3 bg-muted/20 border border-border rounded-lg text-center">
                    <p className="text-[11px] font-semibold text-foreground mb-1">{param.label}</p>
                    <span className="text-lg font-bold text-primary">20%</span>
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
                  defaultValue="[AI Recruit Pro] Undangan Wawancara Video Virtual - {{job_title}}"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Isi Pesan Undangan Wawancara
                </label>
                <textarea 
                  rows={4}
                  defaultValue="Halo {{candidate_name}}, Selamat! CV Anda telah lolos tahap seleksi awal (PO-FIT). Silakan ikuti tautan berikut untuk merekam wawancara video virtual 5 pertanyaan: {{interview_link}}"
                  className="w-full p-4 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Subjek Email Penerimaan (Hire)
                </label>
                <input 
                  type="text"
                  defaultValue="[AI Recruit Pro] Selamat! Anda Diterima di {{company_name}}"
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: HR TEAM ACCESS ==================== */}
        {activeTab === 'team' && (
          <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-foreground mb-1">Anggota Tim HR</h3>
                <p className="text-xs text-muted-foreground">Daftar pengguna yang memiliki akses validasi rekrutmen perusahaan.</p>
              </div>
              <button type="button" className="px-3.5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                + Tambah Anggota HR
              </button>
            </div>

            <div className="space-y-3">
              {teamMembers.map((member, i) => (
                <div key={i} className="p-4 bg-muted/30 border border-border rounded-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{member.name}</p>
                      <p className="text-[11px] text-muted-foreground">{member.email}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-card border border-border text-xs font-semibold rounded-full text-foreground">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm active:scale-95"
          >
            <Save size={16} />
            {t.settings.saveSettings}
          </button>
        </div>

      </form>

    </div>
  );
}
