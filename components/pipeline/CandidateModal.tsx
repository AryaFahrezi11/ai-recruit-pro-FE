'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  X, Play, Volume2, Maximize, CheckCircle2, 
  Check, Lightbulb, FileText, Video
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';

interface CandidateModalProps {
  candidate: { name: string; role: string };
  onClose: () => void;
}

export function CandidateModal({ candidate, onClose }: CandidateModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'interview' | 'cv'>('interview');

  // Dummy data for Radar Chart
  const radarData = [
    { subject: t.modal?.ability, A: 80, fullMark: 100 },
    { subject: t.modal?.intelligent, A: 90, fullMark: 100 },
    { subject: t.modal?.personality, A: 70, fullMark: 100 },
    { subject: t.modal?.attitude, A: 80, fullMark: 100 },
    { subject: t.modal?.emotionalIntelligence, A: 80, fullMark: 100 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-card text-card-foreground w-full max-w-6xl max-h-[90vh] rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header & Tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('interview')}
              className={`flex items-center gap-2 pb-4 -mb-[17px] font-semibold transition-colors border-b-2 ${
                activeTab === 'interview' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Video size={18} />
              {t.modal?.interviewEval}
            </button>
            <button 
              onClick={() => setActiveTab('cv')}
              className={`flex items-center gap-2 pb-4 -mb-[17px] font-semibold transition-colors border-b-2 ${
                activeTab === 'cv' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText size={18} />
              {t.modal?.cvAnalysis}
            </button>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 p-6 custom-scrollbar">
          
          {/* TAB 1: INTERVIEW EVALUATION */}
          {activeTab === 'interview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              
              {/* Left Column: Video & Transcript */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{t.modal?.videoWawancara}</h3>
                  <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800">
                    00:15:32
                  </span>
                </div>
                
                {/* Mock Video Player */}
                <div className="relative rounded-lg overflow-hidden bg-muted aspect-[3/4] border border-border group cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80" alt="Video thumbnail" className="w-full h-full object-cover" />
                  
                  {/* Video Controls overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex flex-col justify-end">
                    <div className="p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="w-full h-1 bg-white/30 rounded-full mb-3">
                        <div className="w-1/3 h-full bg-primary rounded-full"></div>
                      </div>
                      <div className="flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                          <Play size={18} fill="currentColor" />
                          <Volume2 size={18} />
                          <span className="text-xs font-medium">05:12 / 15:32</span>
                        </div>
                        <Maximize size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transcript */}
                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t.modal?.transcriptHighlight}
                  </p>
                  <p className="text-sm italic text-foreground/80 leading-relaxed">
                    "...dalam proyek sebelumnya, saya memimpin tim yang terdiri dari 5 orang engineer untuk memigrasi arsitektur monolith ke microservices, yang meningkatkan efisiensi sistem sebesar 30%..."
                  </p>
                </div>
              </div>

              {/* Middle Column: Radar & AI Metrics */}
              <div className="flex flex-col gap-6">
                
                {/* Header Card */}
                <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{candidate.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{candidate.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-900/50">
                    <CheckCircle2 size={14} />
                    {t.modal?.aiAnalysisComplete}
                  </div>
                </div>

                {/* Radar Chart Card */}
                <div className="bg-card p-5 rounded-lg border border-border shadow-sm flex-1 flex flex-col">
                  <h3 className="font-bold text-center mb-4">{t.modal?.outputKarakteristik}</h3>
                  <div className="flex-1 min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="currentColor" className="text-border" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 11 }} className="text-muted-foreground" />
                        <Radar name="Candidate" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                    <input type="checkbox" className="rounded text-primary focus:ring-primary border-border" defaultChecked />
                    {t.modal?.aiAssessmentScore}
                  </div>
                </div>

                {/* Bottom Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      {t.modal?.personOrgFit}
                    </p>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-emerald-500">87%</span>
                      <span className="text-xs font-semibold text-muted-foreground">{t.modal?.matchRate}</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full">
                      <div className="w-[87%] h-full bg-emerald-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      {t.modal?.humanCapitalMetrics}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground font-medium">{t.modal?.kognitif}</span>
                        <span className="font-bold">8.5/10</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground font-medium">{t.modal?.sosial}</span>
                        <span className="font-bold">7.8/10</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground font-medium">{t.modal?.emosional}</span>
                        <span className="font-bold">8.2/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Human Validation & Actions */}
              <div className="flex flex-col gap-6">
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md">
                      <CheckCircle2 size={18} />
                    </div>
                    <h2 className="text-xl font-bold">{t.modal?.humanValidation}</h2>
                  </div>

                  <div className="space-y-6 flex-1">
                    {[
                      { label: t.modal?.ability, score: 8 },
                      { label: t.modal?.intelligent, score: 9 },
                      { label: t.modal?.personality, score: 7 },
                      { label: t.modal?.attitude, score: 8 },
                      { label: t.modal?.emotionalIntelligence, score: 8 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-2 text-sm font-medium">
                          <span>{item.label}</span>
                          <span>{item.score}</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          defaultValue={item.score}
                          className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t.modal?.catatanValidasi}
                    </label>
                    <textarea 
                      className="w-full p-3 bg-muted/30 border border-border rounded-lg text-sm resize-none h-24 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      placeholder={t.modal?.masukkanCatatan}
                    ></textarea>
                  </div>
                  
                  {/* Primary Submit Button */}
                  <button className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg mt-4 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} />
                    {t.modal?.submitValidasi}
                  </button>
                </div>

                {/* Final Actions */}
                <div className="flex flex-wrap sm:flex-nowrap gap-3">
                  <button className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg text-sm transition-colors">
                    {t.modal?.terima}
                  </button>
                  <button className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg text-sm transition-colors">
                    {t.modal?.tolak}
                  </button>
                  <button className="flex-1 py-2.5 bg-card border border-border hover:bg-muted font-medium rounded-lg text-sm transition-colors">
                    {t.modal?.interviewTambahan}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CV ANALYSIS */}
          {activeTab === 'cv' && (
            <div className="max-w-4xl mx-auto py-4 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold mb-1">{t.modal?.hasilAnalisisCV}</h2>
              <p className="text-muted-foreground mb-8">{t.modal?.skorKeseluruhan}</p>

              {/* Score Card */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-border mb-8 flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                  <span className="text-3xl font-bold text-white">78%</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">{t.modal?.cvCukupBaik}</h3>
                  <p className="text-muted-foreground">{t.modal?.adaBeberapaArea}</p>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-3 mb-10">
                <span className="px-4 py-2 bg-muted/50 border border-border rounded-full text-sm font-medium flex gap-2">
                  <span className="text-muted-foreground">{t.modal?.formatStruktur}:</span>
                  <span className="text-foreground font-bold">79%</span>
                </span>
                <span className="px-4 py-2 bg-muted/50 border border-border rounded-full text-sm font-medium flex gap-2">
                  <span className="text-muted-foreground">{t.modal?.pengalamanRelevan}:</span>
                  <span className="text-foreground font-bold">82%</span>
                </span>
                <span className="px-4 py-2 bg-muted/50 border border-border rounded-full text-sm font-medium flex gap-2">
                  <span className="text-muted-foreground">{t.modal?.keahlianSertifikasi}:</span>
                  <span className="text-foreground font-bold">78%</span>
                </span>
                <span className="px-4 py-2 bg-muted/50 border border-border rounded-full text-sm font-medium flex gap-2">
                  <span className="text-muted-foreground">{t.modal?.prestasiDampak}:</span>
                  <span className="text-foreground font-bold">70%</span>
                </span>
                <span className="px-4 py-2 bg-muted/50 border border-border rounded-full text-sm font-medium flex gap-2">
                  <span className="text-muted-foreground">{t.modal?.bahasaKomunikasi}:</span>
                  <span className="text-foreground font-bold">82%</span>
                </span>
              </div>

              {/* Saran Perbaikan (Suggestions List) */}
              <div>
                <h3 className="font-bold text-lg mb-4">{t.modal?.saranPerbaikan}</h3>
                <ul className="space-y-0">
                  <li className="flex gap-4 py-4 border-b border-border">
                    <Check className="text-blue-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-foreground text-sm">Pengalaman kerja relevan dengan posisi yang dilamar.</p>
                  </li>
                  <li className="flex gap-4 py-4 border-b border-border">
                    <Check className="text-blue-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-foreground text-sm">Struktur CV sudah profesional dan mudah dibaca.</p>
                  </li>
                  <li className="flex gap-4 py-4 border-b border-border">
                    <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-foreground text-sm">Kuantifikasi prestasi dengan angka dan metrik yang jelas.</p>
                  </li>
                  <li className="flex gap-4 py-4 border-b border-border">
                    <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-foreground text-sm">Sertakan keahlian teknis dan sertifikasi yang mendukung posisi.</p>
                  </li>
                  <li className="flex gap-4 py-4">
                    <Lightbulb className="text-amber-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-foreground text-sm">Perbaiki format CV agar lebih rapi dan profesional dengan template yang konsisten.</p>
                  </li>
                </ul>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
