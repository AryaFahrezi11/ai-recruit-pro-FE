'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  HelpCircle, Sparkles, BookOpen, MessageSquare, Send, CheckCircle2,
  ChevronDown, ChevronUp, Bot, FileText, Video, ShieldCheck, Mail, Headphones
} from 'lucide-react';

export default function SupportPage() {
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
      showToast('Tiket bantuan berhasil dikirim! Tim Support kami akan merespons dalam 24 jam.');
      setTicketSubject('');
      setTicketMessage('');
    }
  };

  const faqs = [
    {
      q: 'Mengapa kandidat dengan skor kecocokan 79% ditandai tidak lolos di tahap Seleksi CV?',
      a: 'Sistem AI PO-FIT menggunakan algoritma Cosine Similarity untuk mengukur kecocokan teks CV pelamar dengan deskripsi pekerjaan. Jika skor berada di bawah ambang batas yang ditentukan perusahaan (misal 60%), kandidat akan ditandai gagal seleksi PO-FIT. Namun, HR tetap memiliki wewenang untuk meninjau kembali berkas kandidat tersebut.'
    },
    {
      q: 'Apakah HR dapat mengubah keputusan rekomendasi yang diberikan oleh sistem AI?',
      a: 'Ya, tentu saja! Sistem AI Recruit Pro dirancang sebagai alat bantu (Human Validation Suite). Rekomendasi AI berfungsi sebagai bahan pertimbangan awal, namun keputusan akhir penerimaan (Hire) atau penolakan (Reject) sepenuhnya berada di tangan HR pada Tahap 5 (Validasi Manusia).'
    },
    {
      q: 'Bagaimana proses rekaman wawancara video virtual dari sisi pelamar?',
      a: 'Setelah pelamar lolos seleksi CV, sistem akan mengirimkan undangan email berisi tautan ke portal wawancara. Pelamar akan menjawab 5 pertanyaan yang dikonfigurasi perusahaan secara langsung melalui rekaman kamera web tanpa perlu bertatap muka langsung secara bersamaan.'
    },
    {
      q: 'Bagaimana sistem AI mengekstraksi 5 parameter analisis video wawancara?',
      a: 'Sistem menganalisis 5 indikator gestur dan akustik dari rekaman video: Gerakan Tangan, Gerakan Badan, Gerakan Kepala, Interaksi Mata (Eye Contact), serta Tempo Bicara (Words per Second). Indikator ini kemudian dikalkulasi menjadi 5 nilai output karakteristik (Ability, Intelligent, Personality, Attitude, Emotional Intelligence).'
    },
    {
      q: 'Apakah data dokumen CV dan rekaman video pelamar dijamin kerahasiaannya?',
      a: 'Ya, seluruh data dokumen dan media video disimpan dengan enkripsi kelas bank (AES-256) dan hanya dapat diakses oleh tim HR terverifikasi dari perusahaan yang membuka lowongan.'
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
        <h1 className="text-2xl font-bold text-foreground mb-1">{t.support.title}</h1>
        <p className="text-sm text-muted-foreground">{t.support.subtitle}</p>
      </div>

      {/* Documentation Banner */}
      <div className="bg-card p-6 sm:p-8 rounded-xl border border-primary/20 shadow-sm space-y-6 relative overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{t.support.aiGuideTitle}</h2>
            <p className="text-xs text-muted-foreground">Transparansi alur kerja dan metrik perhitungan AI Recruit Pro</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: PO-FIT */}
          <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <FileText size={16} />
              1. Seleksi CV (PO-FIT)
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Membandingkan Vektor Kata CV dengan Deskripsi Pekerjaan menggunakan algoritma <strong>Cosine Similarity</strong>. Menghasilkan persentase skor kecocokan (60% = Ambang Batas Lolos).
            </p>
          </div>

          {/* Card 2: Video Analysis */}
          <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-violet-500 font-bold text-sm">
              <Video size={16} />
              2. Analisis Video AI
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mengekstraksi 5 parameter gestur: <em>Gerakan Tangan, Badan, Kepala, Interaksi Mata, & Words/Sec</em> dari rekaman wawancara virtual pelamar.
            </p>
          </div>

          {/* Card 3: Human Validation */}
          <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
              <ShieldCheck size={16} />
              3. Validasi Manusia HR
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Menggabungkan seluruh skor AI ke dalam 5 metrik output: <strong>Ability, Intelligent, Personality, Attitude, Emotional Eq.</strong> sebagai bahan pertimbangan HR.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <HelpCircle size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">{t.support.faqTitle}</h2>
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
                  className="w-full p-4 bg-muted/20 hover:bg-muted/40 text-left font-semibold text-xs sm:text-sm text-foreground flex justify-between items-center gap-4 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} className="shrink-0 text-primary" /> : <ChevronDown size={16} className="shrink-0 text-muted-foreground" />}
                </button>

                {isOpen && (
                  <div className="p-4 bg-card border-t border-border text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-200">
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
          <Headphones size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">{t.support.contactTitle}</h2>
        </div>

        <form onSubmit={handleSendTicket} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Subjek Kendala / Pertanyaan <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text"
              required
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              placeholder="e.g. Kendala pemrosesan video wawancara kandidat..."
              className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Rincian Pesan & Kendala Teknis <span className="text-rose-500">*</span>
            </label>
            <textarea 
              rows={4}
              required
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              placeholder="Jelaskan kendala teknis atau pertanyaan yang Anda alami secara detail..."
              className="w-full p-4 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Send size={14} />
              {t.support.sendTicket}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
