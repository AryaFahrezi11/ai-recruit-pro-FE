'use client';

import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, Sparkles, BookOpen, Send, CheckCircle2,
  ChevronDown, ChevronUp, GraduationCap, Headphones, Award
} from 'lucide-react';
import { api } from '@/lib/api';

export default function KampusSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [campusName, setCampusName] = useState('Universitas Harkat Negeri');

  // Ticket Form States
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Akreditasi & Tracer Study');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : '';
    const savedName = typeof window !== 'undefined' 
      ? (localStorage.getItem(`campus_name_${savedEmail}`) || localStorage.getItem('campus_name') || '') 
      : '';

    api.get('/users/profile')
      .then(data => {
        const p = data.profil || data.profile || {};
        const u = data.user || {};
        let cName = p.nama_kampus || savedName || u.nama_kampus || u.name || '';
        if (!cName || cName.toLowerCase().includes('ki informatika')) {
          cName = savedName || 'Universitas Harkat Negeri';
        }
        setCampusName(cName || 'Universitas Harkat Negeri');
      })
      .catch(() => {
        setCampusName(savedName || 'Universitas Harkat Negeri');
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      showToast(`Tiket bantuan Pusat Karir ${campusName} berhasil dikirim! Tim Support kami akan merespons melalui email resmi kampus Anda.`);
      setTicketSubject('');
      setTicketMessage('');
      setIsSubmitting(false);
    }, 600);
  };

  const faqs = [
    {
      q: `Bagaimana sistem memverifikasi data mahasiswa dan alumni ${campusName}?`,
      a: `Mahasiswa dan alumni otomatis terhubung ke sistem portal kampus saat mencantumkan ${campusName} pada riwayat pendidikan (riwayat_pendidikan) di profil/CV mereka. Pelamar bebas mendaftar menggunakan email pribadi apa saja (Gmail, Yahoo, dll), dan sistem secara cerdas mengelompokkannya berdasarkan riwayat pendidikan resmi di CV.`
    },
    {
      q: 'Apakah data laporan Tracer Study dapat diunduh untuk kebutuhan Akreditasi (BAN-PT / LAM)?',
      a: 'Sangat bisa. Seluruh statistik tingkat kelulusan kerja (Employment Rate), daftar perusahaan mitra perekrut, posisi jabatan, serta rentang periode dapat diekspor langsung ke dokumen laporan PDF atau spreadsheet yang siap dilampirkan dalam borang akreditasi perguruan tinggi.'
    },
    {
      q: 'Bagaimana skor AI PO-FIT menilai kesesuaian profil mahasiswa dengan kualifikasi perusahaan?',
      a: 'Algoritma AI PO-FIT menganalisis kesesuaian antara latar belakang pendidikan, keahlian teknis (skills), dan pengalaman mahasiswa dengan kualifikasi deskripsi pekerjaan perusahaan mitra. Nilai persentase match (misal ≥60%) membantu memprediksi keberhasilan mahasiswa pada tahap wawancara.'
    },
    {
      q: 'Bagaimana cara mengetahui perusahaan mana saja yang merekrut mahasiswa dari kampus kami?',
      a: 'Seluruh perusahaan yang membuka lowongan pekerjaan dan menerima lamaran dari mahasiswa/alumni kampus Anda akan terdata secara otomatis pada Dasbor Karir, Distribusi Karir per Fakultas, serta Laporan PDF Mahasiswa.'
    },
    {
      q: 'Bagaimana standar keamanan dan kerahasiaan data pribadi mahasiswa?',
      a: 'Seluruh berkas CV, sertifikat, dan rekaman wawancara virtual mahasiswa dilindungi sesuai standar UU Perlindungan Data Pribadi (PDP) dan GDPR. Data hanya dapat diakses oleh perusahaan mitra resmi yang dilamar oleh mahasiswa yang bersangkutan.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-16 animate-in fade-in duration-300 space-y-8 font-sans antialiased text-slate-900 dark:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white dark:bg-slate-800 dark:text-white border border-slate-700 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Pusat Bantuan & Dokumentasi Karir Kampus
        </h1>
        <p className="text-sm text-muted-foreground">
          Panduan integrasi data mahasiswa, transparansi sistem penilaian AI, serta layanan bantuan teknis Pusat Karir {campusName}.
        </p>
      </div>

      {/* Documentation Banner (Solid colors, no gradient) */}
      <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1A4B9F]/10 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center font-bold border border-[#1A4B9F]/20 shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Dokumentasi & Integrasi Pusat Karir {campusName}
            </h2>
            <p className="text-xs text-muted-foreground">
              Prosedur verifikasi data mahasiswa, pemantauan kelulusan kerja, dan transparansi penilaian AI
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-[#1A4B9F] dark:text-blue-400 font-bold text-sm">
              <GraduationCap size={16} />
              1. Matching Riwayat Pendidikan CV
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mahasiswa dan alumni terdeteksi otomatis saat mencantumkan nama {campusName} pada riwayat pendidikan CV. Pelamar bebas mendaftar dengan email pribadi.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
              <Sparkles size={16} />
              2. Penilaian AI PO-FIT
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Perusahaan menyeleksi profil dan CV mahasiswa menggunakan skor pencocokan AI (Threshold Lolos ≥60%) secara obyektif.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-[#1A4B9F] dark:text-blue-400 font-bold text-sm">
              <Award size={16} />
              3. Borang Tracer Study
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Data kelulusan kerja (Employment Rate) tersimpan real-time dan dapat diunduh langsung untuk pelaporan akreditasi kampus.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <HelpCircle size={20} className="text-[#1A4B9F] dark:text-blue-400" />
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Pertanyaan Umum (FAQ Pusat Karir Kampus)
          </h2>
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
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 bg-muted/20 hover:bg-muted/40 text-left font-bold text-xs sm:text-sm text-foreground flex justify-between items-center gap-4 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} className="shrink-0 text-[#1A4B9F] dark:text-blue-400" /> : <ChevronDown size={16} className="shrink-0 text-muted-foreground" />}
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

      {/* Contact Support Form (Solid colors, no gradient) */}
      <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <Headphones size={20} className="text-[#1A4B9F] dark:text-blue-400" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Layanan Bantuan Teknis Pusat Karir
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kirimkan pertanyaan atau kendala seputar akreditasi, verifikasi mahasiswa, atau integrasi portal kampus.
            </p>
          </div>
        </div>

        <form onSubmit={handleSendTicket} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Kategori Kendala / Layanan <span className="text-rose-500">*</span>
              </label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-border focus:border-[#1A4B9F] rounded-lg text-xs font-semibold text-foreground outline-none cursor-pointer"
              >
                <option value="Akreditasi & Tracer Study">Akreditasi & Tracer Study</option>
                <option value="Verifikasi Data Mahasiswa">Verifikasi Data Mahasiswa</option>
                <option value="Informasi Perekrutan Perusahaan">Informasi Perekrutan Perusahaan</option>
                <option value="Kendala Teknis Account & Portal">Kendala Teknis Account & Portal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Subjek Pertanyaan <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Contoh: Permohonan ekspor data Tracer Study BAN-PT..."
                className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:border-[#1A4B9F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Rincian Pesan / Kendala <span className="text-rose-500">*</span>
            </label>
            <textarea 
              rows={4}
              required
              value={ticketMessage}
              onChange={(e) => setTicketMessage(e.target.value)}
              placeholder="Jelaskan secara detail kendala atau permohonan data yang dibutuhkan oleh Pusat Karir..."
              className="w-full p-4 bg-muted/30 border border-border rounded-lg text-xs font-medium text-foreground focus:outline-none focus:border-[#1A4B9F] resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Mengirim Tiket...' : 'Kirim Pesan Bantuan Kampus'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
