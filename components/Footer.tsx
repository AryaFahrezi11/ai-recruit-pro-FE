import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 py-16 sm:py-20 mt-auto no-print">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 space-y-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 pr-0 lg:pr-12">
            <span className="font-bold text-2xl text-white block">AI-RecruitPro</span>
            <p className="text-slate-400 leading-relaxed text-sm">
              Job platform yang connect Anda dengan top tech companies secara fair dan transparan.
            </p>
            <div className="flex gap-4 pt-2">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-[#1A4B9F] hover:border-[#1A4B9F] hover:text-white transition-all cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></div>
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-[#1DA1F2] hover:border-[#1DA1F2] hover:text-white transition-all cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></div>
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-[#0A66C2] hover:border-[#0A66C2] hover:text-white transition-all cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></div>
            </div>
          </div>

          <div className="space-y-5">
            <h4 className="font-bold text-white text-sm tracking-wider uppercase">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/applicant/login" className="hover:text-white transition-colors">Kandidat</Link></li>
              <li><Link href="/perusahaan/login" className="hover:text-white transition-colors">Perusahaan</Link></li>
              <li><Link href="/applicant/login" className="hover:text-white transition-colors">Fitur Wawancara Video</Link></li>
              <li><Link href="/applicant/login" className="hover:text-white transition-colors">Sistem NLP</Link></li>
            </ul>
          </div>

          <div className="space-y-5">
            <h4 className="font-bold text-white text-sm tracking-wider uppercase">Perusahaan</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Tentang Kami</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Karier</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Kontak</Link></li>
            </ul>
          </div>

          <div className="space-y-5">
            <h4 className="font-bold text-white text-sm tracking-wider uppercase">Legal & Keamanan</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Keamanan Data (ISO 27001)</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} AI-RecruitPro. Hak cipta dilindungi.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Status Sistem</Link>
            <span className="text-slate-600">|</span>
            <button className="hover:text-white transition-colors cursor-pointer">Bahasa: Indonesia</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
