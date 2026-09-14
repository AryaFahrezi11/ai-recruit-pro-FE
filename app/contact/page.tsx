'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { getApiUrl } from '@/lib/api';
import {
  Building2,
  User,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  MessageSquare
} from 'lucide-react';

export default function ContactPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [contactData, setContactData] = useState({
    email: 'support@airecruitpro.id',
    whatsapp: '+62 812-3456-7890',
    location: 'Jakarta, Indonesia'
  });

  useEffect(() => {
    fetch(getApiUrl('/config/public'))
      .then(res => res.json())
      .then(data => {
        setContactData({
          email: data.admin_email || 'support@airecruitpro.id',
          whatsapp: data.support_whatsapp || '+62 812-3456-7890',
          location: data.lokasi_kantor_pusat || 'Jakarta, Indonesia'
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col selection:bg-[#1A4B9F] selection:text-white transition-colors duration-300">
      
      {/* -------------------- TOP NAVBAR -------------------- */}
      <Navbar />

      {/* -------------------- CONTENT SECTION -------------------- */}
      <section className="flex-grow bg-slate-50/60 dark:bg-slate-950 py-10 sm:py-16 transition-colors">
        <div className="max-w-4xl mx-auto px-6 sm:px-10">
          
          <div className="mb-10 text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tighter leading-[1.08] text-slate-900 dark:text-white">
              Hubungi Tim Bantuan
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-lg mx-auto">
              Memiliki pertanyaan terkait platform, proses registrasi, atau kendala teknis? Tim layanan pelanggan AI-RecruitPro siap sedia membantu Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-8">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Informasi Kontak</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <Mail size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Layanan</p>
                    <a href={`mailto:${contactData.email}`} className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white hover:text-blue-500 transition-colors">{contactData.email}</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Hotline / WhatsApp</p>
                    <a href={`https://wa.me/${contactData.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white hover:text-emerald-500 transition-colors">{contactData.whatsapp}</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Kantor Pusat</p>
                    <p className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">{contactData.location}</p>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Gedung AI-Recruit Tower Lt. 10</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 text-white flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                 <MessageSquare size={180} />
               </div>
               
               <div className="relative z-10 space-y-5">
                 <h2 className="text-2xl font-bold text-white leading-tight">Perlu Bantuan Cepat?</h2>
                 <p className="text-sm text-slate-400 leading-relaxed">
                   Tim dukungan kami aktif memonitor pertanyaan Anda pada jam operasional kerja:
                   <br/><br/>
                   <strong className="text-slate-200">Senin - Jumat: 09.00 - 18.00 WIB</strong>
                 </p>
                 
                 <div className="pt-4">
                   <a
                     href={`mailto:${contactData.email}`}
                     className="inline-flex w-full justify-center items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg transition-all cursor-pointer active:scale-95"
                   >
                     <span>Kirim Pesan via Email</span>
                   </a>
                 </div>
               </div>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------- FOOTER -------------------- */}
      <Footer />

    </div>
  );
}
