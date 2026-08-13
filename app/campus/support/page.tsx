'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  HelpCircle, Sparkles, BookOpen, MessageSquare, Send, CheckCircle2,
  ChevronDown, ChevronUp, GraduationCap, FileText, Video, ShieldCheck, Headphones, Award
} from 'lucide-react';

export default function KampusSupportPage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      showToast('Tiket bantuan Career Center berhasil dikirim! Tim Support kami akan menghubungi Anda dalam 24 jam.');
      setTicketSubject('');
      setTicketMessage('');
    }
  };

  const faqs = [
    {
      q: 'Bagaimana cara memverifikasi data mahasiswa terdaftar dari database kampus?',
      a: 'Data mahasiswa yang mendaftar ke AI Recruit Pro akan otomatis diverifikasi menggunakan pencocokan NIM dan email SSO official perguruan tinggi. Pihak Career Center dapat meninjau dan menyetujui akun mahasiswa melalui menu Data Mahasiswa.'
    },
    {
      q: 'Apakah tim Career Center dapat mengunduh laporan Tracer Study untuk kebutuhan akreditasi BAN-PT / LAM?',
      a: 'Ya, seluruh data statistik tingkat kelulusan kerja (Employment Rate), daftar perusahaan perekrut, serta rata-rata masa tunggu lulusan dapat diunduh dalam format PDF/Excel resmi yang siap dilampirkan dalam borang akreditasi.'
    },
    {
      q: 'Bagaimana sistem AI PO-FIT menilai kesesuaian kurikulum mahasiswa dengan kualifikasi perusahaan?',
      a: 'Sistem menganalisis teks CV, transkrip mata kuliah, serta portofolio mahasiswa terhadap deskripsi pekerjaan menggunakan metode Cosine Similarity. Skor 60% ke atas menandakan kualifikasi mahasiswa sangat memenuhi standar kebutuhan industri.'
    },
    {
      q: 'Bagaimana prosedur mengundang perusahaan mitra baru ke dalam ekosistem karir kampus?',
      a: 'Pusat Karir Kampus dapat mengirimkan tautan undangan kemitraan khusus kepada HR Perusahaan melalui menu Pengaturan Kampus atau menghubungi tim Support teknis kami untuk bantuan integrasi.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-16 animate-in fade-in duration-300 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white dark:bg-card dark:text-card-foreground border border-border px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Pusat Bantuan & Dokumentasi Karir Kampus</h1>
        <p className="text-sm text-muted-foreground">Panduan transparansi rekrutmen AI, verifikasi Tracer Study, dan bantuan teknis Career Center.</p>
      </div>

      {/* Documentation Banner */}
      <div className="bg-card p-6 sm:p-8 rounded-xl border border-violet-200 dark:border-violet-900/50 shadow-sm space-y-6 relative overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 flex items-center justify-center font-bold">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Dokumentasi & Integrasi Karir Kampus</h2>
            <p className="text-xs text-muted-foreground">Transparansi penilaian AI dan mekanisme pemantauan kelulusan kerja</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 font-bold text-sm">
              <GraduationCap size={16} />
              1. Verifikasi NIM & Mahasiswa
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mahasiswa terdaftar diverifikasi secara otomatis menggunakan SSO email kampus atau nomor induk mahasiswa (NIM).
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
              <Sparkles size={16} />
              2. Penilaian AI PO-FIT
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Perusahaan mitra menyeleksi CV mahasiswa menggunakan skor Cosine Similarity (Threshold Lolos ≥60%).
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
              <Award size={16} />
              3. Pelaporan Tracer Study
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Penerimaan kerja mahasiswa tercatat real-time dan siap diunduh untuk borang akreditasi perguruan tinggi.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <HelpCircle size={20} className="text-violet-600" />
          <h2 className="text-lg font-bold text-foreground">Pertanyaan yang Sering Diajukan (FAQ Kampus)</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className="border border-border rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 bg-muted/20 hover:bg-muted/40 text-left font-bold text-xs sm:text-sm text-foreground flex justify-between items-center gap-4 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} className="shrink-0 text-violet-600" /> : <ChevronDown size={16} className="shrink-0 text-muted-foreground" />}
                </button>

                {isOpen && (
                  <div className="p-4 bg-card border-t border-border text-xs text-muted-foreground leading-relaxed font-medium animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Support Form */}
      <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <Headphones size={20} className="text-violet-600" />
          <h2 className="text-lg font-bold text-foreground">Hubungi Support Teknis Career Center</h2>
        </div>

        <form onSubmit={handleSendTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Subjek Kendala / Pertanyaan Kampus <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text"
              required
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              placeholder="e.g. Permohonan data laporan Tracer Study untuk akreditasi..."
              className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:border-violet-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Rincian Pesan Kendala <span className="text-rose-500">*</span>
            </label>
            <textarea 
              rows={4}
              required
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              placeholder="Jelaskan kebutuhan atau kendala teknis Career Center secara detail..."
              className="w-full p-4 bg-muted/30 border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:border-violet-600 resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit"
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-violet-600/20 active:scale-95"
            >
              <Send size={14} />
              Kirim Tiket Kendala Kampus
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
