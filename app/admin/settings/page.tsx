'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Server, Globe, Mail, ShieldAlert } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    seo_title: '',
    seo_description: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: ''
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
        setSettings(prev => ({ ...prev, ...data }));
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
        toast.success('Pengaturan sistem berhasil disimpan');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans antialiased">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="text-black dark:text-white" size={24} /> Pengaturan Sistem
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">Konfigurasi global platform AI-Recruit Pro (Hanya untuk Admin/Developer).</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'general' ? 'bg-black text-white shadow-xs' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Globe size={16} className={activeTab === 'general' ? 'text-white' : 'text-black dark:text-white'} /> Umum & SEO
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'email' ? 'bg-black text-white shadow-xs' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Mail size={16} className={activeTab === 'email' ? 'text-white' : 'text-black dark:text-white'} /> SMTP Email
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'system' ? 'bg-black text-white shadow-xs' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Server size={16} className={activeTab === 'system' ? 'text-white' : 'text-black dark:text-white'} /> Maintenance
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-xs border border-slate-200 dark:border-slate-800">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Pengaturan Umum & SEO</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Aplikasi (SEO Title)</label>
                    <input 
                      type="text" 
                      value={settings.seo_title}
                      onChange={(e) => handleChange('seo_title', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Meta (SEO Description)</label>
                    <textarea 
                      value={settings.seo_description}
                      onChange={(e) => handleChange('seo_description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none resize-none font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EMAIL TAB */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">Konfigurasi SMTP Email</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">Pengaturan server email untuk mengirim notifikasi ke pengguna.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">SMTP Host</label>
                    <input 
                      type="text" 
                      value={settings.smtp_host}
                      onChange={(e) => handleChange('smtp_host', e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">SMTP Port</label>
                    <input 
                      type="text" 
                      value={settings.smtp_port}
                      onChange={(e) => handleChange('smtp_port', e.target.value)}
                      placeholder="587"
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Pengirim (From)</label>
                    <input 
                      type="email" 
                      value={settings.smtp_from}
                      onChange={(e) => handleChange('smtp_from', e.target.value)}
                      placeholder="noreply@airecruitpro.com"
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">SMTP Username</label>
                    <input 
                      type="text" 
                      value={settings.smtp_user}
                      onChange={(e) => handleChange('smtp_user', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">SMTP Password</label>
                    <input 
                      type="password" 
                      value={settings.smtp_pass}
                      onChange={(e) => handleChange('smtp_pass', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-slate-400 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SYSTEM TAB */}
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

          {/* Save Action */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} className="text-white" />
              )}
              Simpan Pengaturan
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
