'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, UserCheck, Sparkles, FileText, Video } from 'lucide-react';

export default function EvaluasiKandidatPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/pipeline"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Evaluasi Detail Kandidat #{params?.id || 'APL-01'}</h1>
          <p className="text-xs text-slate-500">Penilaian Person-Organization Fit (PO-FIT) &amp; Rekomendasi AI</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0A2540]">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Ringkasan Evaluasi PO-FIT</span>
        </div>
        <p className="text-xs text-slate-600">
          Kandidat sedang berada pada tahap peninjauan akhir oleh Perekrut/HR Manager.
        </p>
      </div>
    </div>
  );
}
