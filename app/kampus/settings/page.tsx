'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  GraduationCap, Sliders, Mail, Users, Save, CheckCircle2, 
  Building2, Globe, Upload, ShieldCheck, Bell, Award
} from 'lucide-react';

export default function KampusSettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'team'>('profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form States - Campus Profile
  const [univName, setUnivName] = useState('Universitas Indonesia');
  const [accreditation, setAccreditation] = useState('Unggul (A)');
  const [website, setWebsite] = useState('https://career.ui.ac.id');
  const [address, setAddress] = useState('Kampus UI Depok, Jawa Barat 16424');
  const [univDesc, setUnivDesc] = useState(
    'Pusat Pengembangan Karir dan Alumni Universitas Indonesia yang berdedikasi menyalurkan lulusan ke dunia kerja mitra industri global.'
  );

  // Form States - Notifications
  const [notifyOnHired, setNotifyOnHired] = useState(true);
  const [autoTracerReport, setAutoTracerReport] = useState(true);

  // Team Access State
  const [teamMembers] = useState([
    { name: 'Dr. Hendra Wijaya', email: 'director.career@ui.ac.id', role: 'Director of Career Center', avatar: 'HW' },
    { name: 'Dewi Lestari, M.Si', email: 'dewi.career@ui.ac.id', role: 'Corporate Partnership Officer', avatar: 'DL' },
    { name: 'Rahmat Hidayat', email: 'rahmat.admin@ui.ac.id', role: 'Student Tracer Officer', avatar: 'RH' },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Pengaturan Pusat Karir Perguruan Tinggi berhasil diperbarui!');
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
        <p className="text-sm text-muted-foreground">Atur profil universitas, notifikasi kelulusan mahasiswa, dan tim pengelola Career Center.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border gap-2 overflow-x-auto custom-scrollbar">
        {[
          { id: 'profile', label: 'Profil Perguruan Tinggi', icon: GraduationCap },
          { id: 'notifications', label: 'Notifikasi & Tracer Study', icon: Bell },
          { id: 'team', label: 'Tim Career Center', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap -mb-px ${
                isActive 
                  ? 'border-violet-600 text-violet-600 bg-violet-50/50 dark:bg-violet-950/30 rounded-t-lg' 
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
        
        {/* ==================== TAB 1: CAMPUS PROFILE ==================== */}
        {activeTab === 'profile' && (
          <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-violet-600 text-white font-bold text-3xl flex items-center justify-center border border-border shadow-inner shrink-0">
                UI
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">{univName}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Logo Perguruan Tinggi (Digunakan pada sertifikasi & profil mahasiswa)</p>
                <button type="button" className="mt-2 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5">
                  <Upload size={12} />
                  Ubah Logo Kampus
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Nama Perguruan Tinggi</label>
                <input 
                  type="text"
                  value={univName}
                  onChange={(e) => setUnivName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Akreditasi Perguruan Tinggi</label>
                <input 
                  type="text"
                  value={accreditation}
                  onChange={(e) => setAccreditation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Website Official Career Center</label>
                <input 
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:border-violet-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Alamat Kampus Utama</label>
                <input 
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:border-violet-600"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-2">Deskripsi Pusat Karir Kampus</label>
                <textarea 
                  rows={3}
                  value={univDesc}
                  onChange={(e) => setUnivDesc(e.target.value)}
                  className="w-full p-4 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-violet-600 resize-none font-medium"
                ></textarea>
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
                  onChange={(e) => setNotifyOnHired(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-violet-600 focus:ring-violet-600 cursor-pointer"
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
                  onChange={(e) => setAutoTracerReport(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-violet-600 focus:ring-violet-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: TEAM ACCESS ==================== */}
        {activeTab === 'team' && (
          <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-foreground mb-1">Tim Career Center Kampus</h3>
                <p className="text-xs text-muted-foreground">Daftar staf pengelola dan pengawas karir mahasiswa universitas.</p>
              </div>
              <button type="button" className="px-3.5 py-2 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 transition-colors">
                + Tambah Staf Career Center
              </button>
            </div>

            <div className="space-y-3">
              {teamMembers.map((member, i) => (
                <div key={i} className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center text-xs border border-violet-300">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{member.name}</p>
                      <p className="text-[11px] text-muted-foreground">{member.email}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-card border border-border text-xs font-bold rounded-full text-foreground">
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
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-violet-600/20 active:scale-95"
          >
            <Save size={16} />
            Simpan Pengaturan Kampus
          </button>
        </div>

      </form>

    </div>
  );
}
