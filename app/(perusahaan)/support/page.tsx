'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  HelpCircle, Sparkles, BookOpen, MessageSquare, Send, CheckCircle2,
  ChevronDown, ChevronUp, Bot, FileText, Video, ShieldCheck, Mail, Headphones
} from 'lucide-react';

import { api } from '@/lib/api';

export default function SupportPage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('aryafahrezi11@gmail.com');

  React.useEffect(() => {
    api.get('/config/public')
      .then(data => {
        if (data.admin_email) {
          setAdminEmail(data.admin_email);
        }
      })
      .catch(err => console.error("Failed to fetch admin email", err));
  }, []);

  // Ticket Form States
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketSubject && ticketMessage) {
      // Buka email client default yang mengarah ke admin developer
      const mailtoLink = `mailto:${adminEmail}?subject=${encodeURIComponent(ticketSubject)}&body=${encodeURIComponent(ticketMessage)}`;
      window.location.href = mailtoLink;
      
      showToast('Mengarahkan ke email untuk dikirim ke Admin Developer...');
      setTicketSubject('');
      setTicketMessage('');
    }
  };

  const faqs = [
    {
      q: 'Mengapa kandidat dengan skor kecocokan 79% ditandai tidak lolos di tahap Seleksi CV?',
      a: 'Sistem AI menggunakan algoritma Cosine Similarity untuk mengukur kecocokan teks CV pelamar dengan deskripsi pekerjaan. Jika skor berada di bawah ambang batas yang ditentukan perusahaan (misal 60%), kandidat akan ditandai gagal seleksi PO-FIT. Namun, HR tetap memiliki wewenang untuk meninjau kembali.'
    },
    {
      q: 'Apakah HR dapat mengubah keputusan rekomendasi yang diberikan oleh sistem AI?',
      a: 'Ya! Sistem AI dirancang sebagai Human Validation Suite. Rekomendasi AI berfungsi sebagai bahan pertimbangan awal, namun keputusan akhir (Hire/Reject) sepenuhnya di tangan HR pada Tahap Validasi.'
    },
    {
      q: 'Bagaimana proses rekaman wawancara video dari sisi pelamar?',
      a: 'Setelah lolos seleksi CV, pelamar mendapat undangan email ke portal wawancara. Pelamar menjawab 5 pertanyaan secara langsung melalui rekaman kamera web.'
    },
    {
      q: 'Bagaimana sistem AI mengekstraksi 5 parameter analisis video wawancara?',
      a: 'Sistem menganalisis 5 indikator gestur/akustik: Gerakan Tangan, Badan, Kepala, Interaksi Mata, & Tempo Bicara. Indikator ini dikalkulasi menjadi 5 nilai (Ability, Intelligent, Personality, Attitude, Emotional Intelligence).'
    },
    {
      q: 'Apakah data dokumen CV dan rekaman video pelamar dijamin kerahasiaannya?',
      a: 'Ya, seluruh data disimpan dengan enkripsi (AES-256) dan hanya dapat diakses oleh tim HR terverifikasi dari perusahaan yang membuka lowongan.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-in fade-in duration-500 font-sans space-y-4">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 border border-slate-700 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Global Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.support.title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.support.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Docs & FAQ */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Documentation Banner (Dense) */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 p-4">
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <BookOpen size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.support.aiGuideTitle}</h2>
                <p className="text-[11px] text-slate-500">Transparansi alur kerja dan metrik AI</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200 mb-1.5">
                  <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                  1. Seleksi CV
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Membandingkan Vektor CV vs Deskripsi Pekerjaan (Cosine Similarity). Menghasilkan skor kecocokan.
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200 mb-1.5">
                  <Video size={14} className="text-blue-600 dark:text-blue-400" />
                  2. Analisis Video AI
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Mengekstraksi 5 parameter gestur & akustik dari rekaman wawancara virtual pelamar secara otomatis.
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200 mb-1.5">
                  <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
                  3. Validasi HR
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Konsolidasi nilai menjadi 5 metrik (Ability, Eq, dll) sebagai bahan pertimbangan akhir HR (Human-in-the-loop).
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Accordion (Dense) */}
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 p-4">
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <HelpCircle size={16} />
              </div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.support.faqTitle}</h2>
            </div>
            
            <div className="p-4 space-y-2">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full px-3 py-2.5 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/30 dark:hover:bg-slate-900/50 text-left font-bold text-[11px] text-slate-800 dark:text-slate-200 flex justify-between items-center gap-3 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={14} className="shrink-0 text-blue-600" /> : <ChevronDown size={14} className="shrink-0 text-slate-400" />}
                    </button>
                    {isOpen && (
                      <div className="px-3 py-2.5 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed animate-in fade-in duration-200">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Contact Admin Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden sticky top-6">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 p-4">
              <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <Mail size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Hubungi Developer</h2>
                <p className="text-[10px] text-slate-500">Kirim email ke Admin Developer</p>
              </div>
            </div>

            <form onSubmit={handleSendTicket} className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subjek <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Bug pada tabel dashboard..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rincian Pesan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Jelaskan detail kendala teknis atau saran..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 transition-colors resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-slate-900 hover:bg-blue-600 dark:bg-white dark:hover:bg-blue-500 dark:text-slate-900 text-white font-bold text-xs rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                <Send size={14} />
                Kirim via Email Client
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
