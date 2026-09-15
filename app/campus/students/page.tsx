'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { api } from '@/lib/api';
import { fetchAuth } from '@/lib/api/auth';
import { normalizeMajorName } from '@/lib/utils/major';
import { Pagination } from '@/components/ui/DataTable';
import {
  Users, Search, GraduationCap, CheckCircle2, XCircle, Clock,
  Building2, Eye, FileText, X,
  Download, Video, Play, RefreshCw, FileCheck, VideoOff, AlertCircle, Calendar, ArrowRight
} from 'lucide-react';

interface ApplicationHistory {
  id?: string;
  company: string;
  role: string;
  status: 'hired' | 'rejected' | 'in_progress';
  stageText: string;
  poFitScore: number;
  dateApplied: string;
  video_url?: string;
  videoUrl?: string;
  video_playback_url?: string;
  videoPlaybackUrl?: string;
  ai_result?: any;
}

interface StudentItem {
  id: string;
  nim: string;
  name: string;
  major: string;
  gpa: number;
  batch: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  summary?: string;
  experiences?: Array<{ company: string; role: string; period: string; description: string }>;
  education?: Array<{ school: string; degree: string; period: string; gpa: string }>;
  categorizedSkills?: Array<{ category: string; items: string }>;
  certifications?: Array<{ name: string; credentialUrl: string }>;
  primaryStatus: 'hired' | 'rejected' | 'in_progress';
  targetCompany: string;
  targetRole: string;
  avgPoFit: number;
  cvFileName: string;
  videoUrl?: string;
  videoPlaybackUrl?: string;
  videoDuration: string;
  videoScores: {
    ability: number;
    intelligent: number;
    personality: number;
    attitude: number;
    emotionalIntelligence: number;
  };
  videoTranscript?: string;
  aiResult?: any;
  applications: ApplicationHistory[];
}


function KampusMahasiswaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const initialKeyword = searchParams.get('keyword') || '';
  const [searchInput, setSearchInput] = useState(initialKeyword);
  const [searchQuery, setSearchQuery] = useState(initialKeyword);
  const [majorFilter, setMajorFilter] = useState(searchParams.get('major') || 'All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'hired' | 'in_progress' | 'rejected'>((searchParams.get('status') as any) || 'all');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const kw = searchParams.get('keyword') || '';
    setSearchInput(kw);
    setSearchQuery(kw);
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, majorFilter, statusFilter, startDate, endDate]);

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== 'All') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [modalTab, setModalTab] = useState<'applications' | 'cv' | 'video'>('applications');
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const handleDownloadCv = (student: StudentItem) => {
    const cleanName = student.name.replace(/\s+/g, '_');
    const fileName = `CV_${cleanName}_ATS.pdf`;
    const email = student.email || `${student.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    const phone = student.phone || '081287654321';
    const location = student.location || 'Jakarta, Indonesia';
    const linkedin = student.linkedinUrl || `linkedin.com/in/${student.name.toLowerCase().replace(/\s+/g, '')}`;
    const role = (student.targetRole && student.targetRole !== '-' ? student.targetRole : student.major).toUpperCase();
    const summary = student.summary || `Mahasiswa aktif berprestasi dari ${student.major} di ${campusName} dengan IPK ${student.gpa}. Memiliki pemahaman mendalam dalam rekayasa perangkat lunak, arsitektur sistem modern, serta analisis data rekrutmen. Berpengalaman memimpin proyek tim dan siap berkontribusi secara profesional di dunia industri.`;

    const pdfEsc = (str: string) => str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

    const wrapText = (text: string, maxChars: number = 80): string[] => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      words.forEach(w => {
        if ((currentLine + ' ' + w).length <= maxChars) {
          currentLine = currentLine ? currentLine + ' ' + w : w;
        } else {
          lines.push(currentLine);
          currentLine = w;
        }
      });
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    const streamLines: string[] = [];
    let y = 790;

    // Header
    streamLines.push(`BT /F1 16 Tf 50 ${y} Td (${pdfEsc(student.name.toUpperCase())}) Tj ET`);
    y -= 20;
    streamLines.push(`BT /F1 10 Tf 50 ${y} Td (${pdfEsc(role)}) Tj ET`);
    y -= 16;
    streamLines.push(`BT /F2 9 Tf 50 ${y} Td (${pdfEsc(`${email}   |   ${phone}   |   ${location}`)}) Tj ET`);
    y -= 14;
    streamLines.push(`BT /F2 9 Tf 50 ${y} Td (${pdfEsc(`LinkedIn: ${linkedin}`)}) Tj ET`);
    y -= 15;

    // Divider 1
    streamLines.push(`0.5 w 50 ${y} m 545 ${y} l S`);
    y -= 20;

    // Section 1: Ringkasan
    streamLines.push(`BT /F1 11 Tf 50 ${y} Td (RINGKASAN PROFESIONAL) Tj ET`);
    y -= 8;
    streamLines.push(`0.25 w 50 ${y} m 545 ${y} l S`);
    y -= 16;

    const summaryWrapped = wrapText(summary, 85);
    summaryWrapped.forEach(line => {
      streamLines.push(`BT /F2 9.5 Tf 50 ${y} Td (${pdfEsc(line)}) Tj ET`);
      y -= 13;
    });
    y -= 10;

    // Section 2: Pengalaman Kerja
    streamLines.push(`BT /F1 11 Tf 50 ${y} Td (PENGALAMAN KERJA) Tj ET`);
    y -= 8;
    streamLines.push(`0.25 w 50 ${y} m 545 ${y} l S`);
    y -= 16;

    const exps = student.experiences && student.experiences.length > 0 ? student.experiences : [
      { role: 'Software Engineer Intern', company: 'PT Solusi Teknologi Utama', period: 'Jan 2026 - Jun 2026', description: 'Mengembangkan komponen frontend dashboard rekrutmen menggunakan React.js & TypeScript, memangkas waktu pemrosesan data hingga 35%.' },
      { role: 'Asisten Praktikum Laboratorium', company: campusName, period: 'Aug 2025 - Dec 2025', description: 'Membimbing 60+ mahasiswa dalam praktikum algoritma, pemrograman berorientasi objek, dan manajemen basis data.' }
    ];

    const batchYear = student.batch && student.batch !== '-' ? (student.batch.startsWith('20') ? student.batch : `20${student.batch}`) : '';

    exps.forEach(exp => {
      streamLines.push(`BT /F1 9.5 Tf 50 ${y} Td (${pdfEsc(`${exp.role || 'Posisi'} - ${exp.company || 'Perusahaan'}`)}) Tj ET`);
      streamLines.push(`BT /F2 9 Tf 460 ${y} Td (${pdfEsc(exp.period || '')}) Tj ET`);
      y -= 14;
      if (exp.description) {
        const descLines = wrapText(exp.description, 80);
        descLines.forEach((dl, i) => {
          streamLines.push(`BT /F2 9 Tf 62 ${y} Td (${pdfEsc(i === 0 ? `- ${dl}` : `  ${dl}`)}) Tj ET`);
          y -= 13;
        });
      }
      y -= 6;
    });
    y -= 6;

    // Section 3: Pendidikan
    streamLines.push(`BT /F1 11 Tf 50 ${y} Td (PENDIDIKAN) Tj ET`);
    y -= 8;
    streamLines.push(`0.25 w 50 ${y} m 545 ${y} l S`);
    y -= 16;

    const edus = student.education && student.education.length > 0 ? student.education : [
      { degree: student.major, school: campusName, gpa: `IPK ${student.gpa} / 4.00`, period: `${batchYear ? `${batchYear} - Sekarang` : 'Sekarang'}` }
    ];

    edus.forEach(edu => {
      const eduStr = `${edu.degree || student.major} - ${edu.school || campusName} (${edu.gpa ? (edu.gpa.includes('IPK') ? edu.gpa : `IPK ${edu.gpa}`) : `IPK ${student.gpa}`})`;
      streamLines.push(`BT /F1 9.5 Tf 50 ${y} Td (${pdfEsc(eduStr)}) Tj ET`);
      streamLines.push(`BT /F2 9 Tf 460 ${y} Td (${pdfEsc(edu.period || `${batchYear ? `${batchYear} - Sekarang` : 'Sekarang'}`)}) Tj ET`);
      y -= 18;
    });
    y -= 6;

    // Section 4: Keahlian & Sertifikasi
    streamLines.push(`BT /F1 11 Tf 50 ${y} Td (KEAHLIAN TEKNIS & SERTIFIKASI) Tj ET`);
    y -= 8;
    streamLines.push(`0.25 w 50 ${y} m 545 ${y} l S`);
    y -= 16;

    streamLines.push(`BT /F1 9.5 Tf 50 ${y} Td (Keahlian:) Tj ET`);
    y -= 14;

    const skills = student.categorizedSkills && student.categorizedSkills.length > 0 ? student.categorizedSkills : [
      { category: 'Programming Languages', items: 'TypeScript, JavaScript, Python, SQL' },
      { category: 'Frameworks & Libraries', items: 'React.js, Next.js, Node.js, Tailwind CSS' },
      { category: 'Databases & Tools', items: 'PostgreSQL, REST API, Git & GitHub, Docker' }
    ];

    skills.forEach(s => {
      streamLines.push(`BT /F2 9 Tf 62 ${y} Td (${pdfEsc(`- ${s.category}: ${s.items}`)}) Tj ET`);
      y -= 13;
    });
    y -= 6;

    streamLines.push(`BT /F1 9.5 Tf 50 ${y} Td (Sertifikasi:) Tj ET`);
    y -= 14;

    const certs = student.certifications && student.certifications.length > 0 ? student.certifications : [
      { name: 'AWS Certified Cloud Practitioner - Amazon Web Services', credentialUrl: '' },
      { name: 'Sertifikasi Kompetensi Nasional - BNSP Indonesia', credentialUrl: '' }
    ];

    certs.forEach(c => {
      streamLines.push(`BT /F2 9 Tf 62 ${y} Td (${pdfEsc(`- ${c.name}`)}) Tj ET`);
      y -= 13;
    });

    const shortId = student.id.includes('-') ? student.id.split('-')[0].toUpperCase() : student.id.slice(0, 8).toUpperCase();
    const formattedRefId = `Ref ID: CV-ATS-${shortId}-${batchYear || student.batch}`;
    const truncatedCampusName = campusName.length > 35 ? `${campusName.slice(0, 35)}...` : campusName;

    // Footer
    streamLines.push(`0.5 w 50 48 m 545 48 l S`);
    streamLines.push(`BT /F2 8 Tf 50 34 Td (${pdfEsc(`Dokumen Digital Resmi - Pusat Karir ${truncatedCampusName}`)}) Tj ET`);
    streamLines.push(`BT /F2 8 Tf 420 34 Td (${pdfEsc(formattedRefId)}) Tj ET`);

    const streamContent = streamLines.join('\n');
    const streamLength = streamContent.length;

    const objects: string[] = [
      `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
      `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /MediaBox [0 0 595.28 841.89] /Contents 6 0 R >>\nendobj\n`,
      `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`,
      `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
      `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`
    ];

    const header = `%PDF-1.4\n`;
    let currentOffset = header.length;
    const offsets: number[] = [0];

    objects.forEach(obj => {
      offsets.push(currentOffset);
      currentOffset += obj.length;
    });

    const xrefOffset = currentOffset;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
      xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    const fullPdf = header + objects.join('') + xref + trailer;

    const blob = new Blob([fullPdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Berkas ${fileName} berhasil diunduh!`);
  };

  // Students Data (Loaded dynamically based on riwayat_pendidikan matching logged in campus)
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [campusName, setCampusName] = useState('Pusat Karir Kampus');

  useEffect(() => {
    let currentCampus = '';
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : '';
    const savedName = typeof window !== 'undefined'
      ? (localStorage.getItem(`campus_name_${savedEmail}`) || localStorage.getItem('campus_name') || '')
      : '';

    // 1. Fetch campus profile
    api.get('/users/profile')
      .then(data => {
        const p = data.profil || data.profile || {};
        const u = data.user || {};
        const cName = p.nama_kampus || savedName || u.nama_kampus || u.name || (u.email ? u.email.split('@')[0] : '');
        if (cName) {
          setCampusName(cName);
          currentCampus = cName;
        } else if (savedName) {
          setCampusName(savedName);
          currentCampus = savedName;
        }
        loadCampusStudents(currentCampus);
      })
      .catch(() => {
        if (savedName) {
          currentCampus = savedName;
          setCampusName(savedName);
        } else if (savedEmail && savedEmail.includes('@')) {
          const domain = savedEmail.split('@')[1];
          const parts = domain.split('.')[0];
          currentCampus = parts.charAt(0).toUpperCase() + parts.slice(1);
          setCampusName(currentCampus);
        }
        loadCampusStudents(currentCampus);
      });

    const loadCampusStudents = async (targetCampus: string) => {
      const studentList: StudentItem[] = [];

      const parseEduList = (raw: any): any[] => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'object' && raw !== null) return [raw];
        if (typeof raw === 'string') {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
            if (typeof parsed === 'object' && parsed !== null) return [parsed];
            if (typeof parsed === 'string') {
              try {
                const doubleParsed = JSON.parse(parsed);
                if (Array.isArray(doubleParsed)) return doubleParsed;
                if (typeof doubleParsed === 'object' && doubleParsed !== null) return [doubleParsed];
              } catch (_) { }
            }
          } catch (_) {
            return [{ school: raw }];
          }
        }
        return [];
      };

      try {
        const res = await fetchAuth('/api/admin/users?role=pelamar');
        const candidateUsers: any[] = res.ok ? await res.json() : [];

        candidateUsers.forEach((u: any, idx: number) => {
          const edList = parseEduList(u.profil?.riwayat_pendidikan || u.profil?.pendidikan);

          const checkSchoolMatch = (item: any) => {
            const rawSchool = (item.school || item.nama_sekolah || item.universitas || item.kampus || (typeof item === 'string' ? item : '')).trim();
            if (!rawSchool) return false;
            if (!targetCampus || targetCampus.trim() === '' || targetCampus === 'Pusat Karir Kampus') return true;

            const sLower = rawSchool.toLowerCase();
            let tLower = targetCampus.toLowerCase().trim();

            if (savedEmail && savedEmail.includes('@')) {
              const domainSlug = savedEmail.split('@')[1].split('.')[0];
              if (domainSlug && domainSlug.length >= 3) {
                tLower += ` ${domainSlug}`;
              }
            }

            if (sLower.includes(tLower) || tLower.includes(sLower)) return true;

            const sAlpha = sLower.replace(/[^a-z0-9]/g, '');
            const tAlpha = tLower.replace(/[^a-z0-9]/g, '');
            if (!sAlpha || !tAlpha) return false;
            if (sAlpha.includes(tAlpha) || tAlpha.includes(sAlpha)) return true;

            const kwTokens = tAlpha.split(/universitas|institut|politeknik|sekolah|tinggi|akademi|stmik|univ|ac|id/g).filter((k: string) => k.length >= 3);
            for (const kw of kwTokens) {
              if (sAlpha.includes(kw)) return true;
            }

            const sTokens = sAlpha.split(/universitas|institut|politeknik|sekolah|tinggi|akademi|stmik|univ/g).filter((k: string) => k.length >= 3);
            for (const kw of sTokens) {
              if (tAlpha.includes(kw)) return true;
            }

            return false;
          };

          const matchedEd = edList.find(checkSchoolMatch) || (edList.length > 0 && (!targetCampus || targetCampus === 'Pusat Karir Kampus') ? edList[0] : null);

          // Only include student if riwayat_pendidikan actually matches the logged-in campus
          if (matchedEd) {
            const rawMajor = matchedEd.major || matchedEd.jurusan || matchedEd.program_studi || matchedEd.degree || u.profil?.jurusan || 'Teknik Informatika (S1)';
            const majorName = normalizeMajorName(rawMajor);
            const parsedGpa = parseFloat(matchedEd.gpa || u.profil?.ipk || '0');
            const batchPeriod = matchedEd.period ? matchedEd.period.split('-')[0].trim() : (u.profil?.angkatan || '-');

            const parsedApplications: ApplicationHistory[] = Array.isArray(u.applications) && u.applications.length > 0 ? u.applications.map((app: any) => {
              const rawSt = String(app.status || app.rawStatus || '').toLowerCase().trim();
              const rawTahap = String(app.stageText || app.tahapan || app.tahapRekrutmen || app.statusMessage || '').toLowerCase().trim();

              let appStatus: 'hired' | 'rejected' | 'in_progress' = 'in_progress';
              
              // 1. Check REJECTED / DITOLAK / TIDAK LOLOS FIRST
              if (
                rawSt === 'rejected' || rawSt === 'ditolak' || rawSt === 'ditolak_sistem' ||
                rawSt === 'tidak lolos' || rawSt === 'tidak_lolos' || rawSt === 'tidak-lolos' ||
                rawTahap.includes('ditolak') || rawTahap.includes('tidak lolos') || rawTahap.includes('gagal') || rawTahap.includes('tidak_lolos')
              ) {
                appStatus = 'rejected';
              }
              // 2. Check HIRED / DITERIMA KERJA SECOND (Final stage acceptance only!)
              else if (
                rawSt === 'hired' || rawSt === 'diterima' || rawSt === 'accepted' ||
                rawTahap.includes('diterima kerja') || rawTahap.includes('diterima') || rawTahap.includes('offering') || rawTahap.includes('hired')
              ) {
                appStatus = 'hired';
              }
              // 3. All intermediate selection stages stay IN_PROGRESS (e.g., Lolos CV, Video Interview, Virtual Interview)
              else {
                appStatus = 'in_progress';
              }

              let stageText = app.stageText || app.tahapan || app.tahapRekrutmen || app.statusMessage || 'Sedang Dalam Seleksi';
              if (appStatus === 'rejected') {
                stageText = app.stageText || app.tahapan || app.tahapRekrutmen || app.catatanPerusahaan || app.catatan_perusahaan || app.statusMessage || 'Ditolak / Tidak Lolos Seleksi';
              } else if (appStatus === 'hired') {
                stageText = app.stageText || app.tahapan || app.tahapRekrutmen || 'Diterima Kerja';
              }

              return {
                id: app.id || app.applicationId || app.application_id,
                company: app.company || app.companyName || app.nama_perusahaan || app.perusahaan?.nama_perusahaan || app.perusahaan?.name || app.company_name || u.targetCompany || u.profil?.targetCompany || '-',
                role: app.role || app.jobTitle || app.posisi || app.job_title || app.lowongan?.posisi || app.lowongan?.judul || app.lowongan?.title || app.job?.title || app.job?.posisi || u.targetRole || u.profil?.jobTitle || '-',
                status: appStatus,
                stageText,
                poFitScore: app.poFitScore || app.score || app.cvScore || 0,
                dateApplied: app.dateApplied || app.applyDate || app.tanggal_melamar || app.created_at || app.createdAt || app.date || 'Terbaru',
                video_url: app.video_url || app.videoUrl || app.video_path,
                videoUrl: app.videoUrl || app.video_url || app.video_path,
                video_playback_url: app.video_playback_url || app.videoPlaybackUrl,
                videoPlaybackUrl: app.video_playback_url || app.videoPlaybackUrl,
                ai_result: app.ai_result,
              };
            }) : [];

            const appWithVideo = parsedApplications.find(a => a.video_url || a.videoUrl || a.video_playback_url || a.videoPlaybackUrl);
            const extractedVideoUrl = appWithVideo 
              ? (appWithVideo.video_playback_url || appWithVideo.video_url || appWithVideo.videoUrl)
              : (u.video_playback_url || u.video_url || u.videoUrl || u.video_path || u.profil?.video_url || u.profil?.videoUrl);
            const extractedPlaybackUrl = appWithVideo
              ? (appWithVideo.video_playback_url || appWithVideo.videoPlaybackUrl)
              : (u.video_playback_url || u.videoPlaybackUrl);
            let extractedAiResult = appWithVideo?.ai_result || u.ai_result || (parsedApplications.find(a => a.ai_result)?.ai_result);
            
            if (typeof extractedAiResult === 'string') {
                try {
                    extractedAiResult = JSON.parse(extractedAiResult);
                } catch (e) {}
            }
            
            let vScores = { ability: 0, intelligent: 0, personality: 0, attitude: 0, emotionalIntelligence: 0 };
            let vTranscript = '';
            let vDuration = '-';

            const parseScore = (val: any): number => {
              if (val === null || val === undefined) return 0;
              if (typeof val === 'number') return Math.round(val);
              if (typeof val === 'string') {
                const cleaned = parseFloat(val.replace('%', '').trim());
                return isNaN(cleaned) ? 0 : Math.round(cleaned);
              }
              return 0;
            };

            if (extractedAiResult && typeof extractedAiResult === 'object') {
                const dp = extractedAiResult.dimensi_psikologis || extractedAiResult.scores || extractedAiResult.parameter_analisis || {};
                vScores = {
                    ability: parseScore(dp.Ability ?? dp.ability ?? extractedAiResult.ability ?? extractedAiResult.scores?.ability),
                    intelligent: parseScore(dp.Intelligent ?? dp.intelligent ?? extractedAiResult.intelligent ?? extractedAiResult.scores?.intelligent),
                    personality: parseScore(dp.Personality ?? dp.personality ?? extractedAiResult.personality ?? extractedAiResult.scores?.personality),
                    attitude: parseScore(dp.Attitude ?? dp.attitude ?? extractedAiResult.attitude ?? extractedAiResult.scores?.attitude),
                    emotionalIntelligence: parseScore(dp['Emotional Intelligent'] ?? dp['Emotional Intelligence'] ?? dp.emotionalIntelligence ?? extractedAiResult.emotionalIntelligence ?? extractedAiResult.scores?.emotionalIntelligence),
                };
                vTranscript = extractedAiResult.full_transcript || extractedAiResult.transcript || extractedAiResult.ringkasan_jawaban || extractedAiResult.transkripsi || extractedAiResult.text || extractedAiResult.summary || '';
                vDuration = extractedAiResult.durasi_formatted || extractedAiResult.durasi_teks || extractedAiResult.duration || extractedAiResult.durasi || (extractedVideoUrl ? '00:59' : '-');
            } else if (extractedVideoUrl) {
                vScores = u.videoScores || { ability: 0, intelligent: 0, personality: 0, attitude: 0, emotionalIntelligence: 0 };
                vDuration = u.videoDuration || '-';
            }



            const primaryApp = parsedApplications.length > 0 ? parsedApplications[0] : null;
            const resolvedCompany = primaryApp ? primaryApp.company : (u.targetCompany || u.profil?.targetCompany || '-');
            const resolvedRole = primaryApp ? primaryApp.role : (u.targetRole || u.profil?.jobTitle || '-');

            const rawUserStatus = String(u.status || u.profil?.status || '').toLowerCase().trim();
            const isAnyHired = parsedApplications.some(a => a.status === 'hired') ||
              ['hired', 'diterima', 'accepted'].includes(rawUserStatus);

            const isAnyInProgress = parsedApplications.some(a => a.status === 'in_progress');

            const isAnyRejected = parsedApplications.some(a => a.status === 'rejected') ||
              ['rejected', 'ditolak', 'ditolak_sistem', 'tidak lolos', 'tidak_lolos', 'tidak-lolos'].includes(rawUserStatus);

            const computedPrimaryStatus: 'hired' | 'rejected' | 'in_progress' = isAnyHired
              ? 'hired'
              : isAnyInProgress
                ? 'in_progress'
                : isAnyRejected
                  ? 'rejected'
                  : 'in_progress';

            const studentItem: StudentItem = {
              id: u.id || `mhs-db-${idx}`,
              nim: u.profil?.nim || '-',
              name: u.name || u.profil?.nama_lengkap || u.email?.split('@')[0] || 'Pelamar',
              major: majorName,
              gpa: isNaN(parsedGpa) ? 0 : parsedGpa,
              batch: batchPeriod,
              email: u.email || u.profil?.email,
              phone: u.profil?.no_telepon || u.profil?.telepon || u.profil?.phone,
              location: u.profil?.alamat || u.profil?.domisili || u.profil?.lokasi,
              linkedinUrl: u.profil?.linkedin_url || u.profil?.linkedin,
              portfolioUrl: u.profil?.portfolio_url || u.profil?.portfolio,
              summary: u.profil?.ringkasan_diri || u.profil?.ringkasan || u.profil?.bio,
              experiences: (() => {
                  const val = u.profil?.pengalaman_kerja || u.profil?.pengalaman;
                  if (Array.isArray(val)) return val;
                  if (typeof val === 'string' && val) { try { return JSON.parse(val); } catch(e) { return undefined; } }
                  return undefined;
              })(),
              education: (() => {
                  const val = u.profil?.riwayat_pendidikan;
                  if (Array.isArray(val)) return val;
                  if (typeof val === 'string' && val) { try { return JSON.parse(val); } catch(e) { return undefined; } }
                  return undefined;
              })(),
              categorizedSkills: (() => {
                  const val = u.profil?.keahlian || u.profil?.skills;
                  if (Array.isArray(val)) return val;
                  if (typeof val === 'string' && val) { try { return JSON.parse(val); } catch(e) { return undefined; } }
                  return undefined;
              })(),
              certifications: (() => {
                  const val = u.profil?.sertifikasi;
                  if (Array.isArray(val)) return val;
                  if (typeof val === 'string' && val) { try { return JSON.parse(val); } catch(e) { return undefined; } }
                  return undefined;
              })(),
              primaryStatus: computedPrimaryStatus,
              targetCompany: resolvedCompany,
              targetRole: resolvedRole,
              avgPoFit: u.avgPoFit || u.poFitScore || 0,
              cvFileName: u.cv_filename || `CV_${(u.name || 'Pelamar').replace(/\s+/g, '_')}.pdf`,
              videoUrl: extractedVideoUrl,
              videoPlaybackUrl: extractedPlaybackUrl,
              videoDuration: extractedVideoUrl ? vDuration : '-',
              videoScores: vScores,
              videoTranscript: vTranscript,
              aiResult: extractedAiResult,
              applications: parsedApplications.length > 0 ? parsedApplications : [
                {
                  company: resolvedCompany,
                  role: resolvedRole,
                  status: computedPrimaryStatus,
                  stageText: computedPrimaryStatus === 'rejected' ? 'Ditolak / Tidak Lolos Seleksi' : computedPrimaryStatus === 'hired' ? 'Diterima Kerja' : 'Sedang Dalam Seleksi AI-RecruitPro',
                  poFitScore: u.avgPoFit || 0,
                  dateApplied: 'Terbaru',
                  video_url: extractedVideoUrl,
                  videoUrl: extractedVideoUrl
                }
              ]
            };
            studentList.push(studentItem);
          }
        });
      } catch {
        // network fallback
      }

      // Check local candidate CV data from browser storage
      if (typeof window !== 'undefined') {
        const cvStr = localStorage.getItem('candidateCvData');
        if (cvStr) {
          try {
            const cv = JSON.parse(cvStr);
            const edList = cv.education || [];
            const matchedEd = edList.find((ed: any) => {
              const s = (ed.school || '').toLowerCase();
              const tComp = targetCampus.toLowerCase();
              return s.includes(tComp) || tComp.includes(s) || (s.includes('ui') && tComp.includes('indonesia'));
            });

            if (matchedEd) {
              const rawMajor = matchedEd.degree || matchedEd.major || matchedEd.jurusan || cv.jobTitle || 'Teknik Informatika (S1)';
              const majorName = normalizeMajorName(rawMajor);
              const localVideo = typeof window !== 'undefined' ? (localStorage.getItem('candidateVideoUrl') || localStorage.getItem('applicantVideoUrl') || cv.videoUrl || cv.video_url || cv.video_path) : undefined;
              
              const localStatusStr = typeof window !== 'undefined' 
                ? String(localStorage.getItem('candidateStatus') || localStorage.getItem('applicantStatus') || cv.status || '').toLowerCase().trim()
                : '';
              const isLocalRejected = ['rejected', 'ditolak', 'ditolak_sistem', 'tidak lolos', 'tidak_lolos', 'tidak-lolos'].includes(localStatusStr);
              const isLocalHired = ['hired', 'diterima', 'accepted'].includes(localStatusStr);

              let localApps: ApplicationHistory[] = [];
              const savedMyAppsStr = typeof window !== 'undefined' ? localStorage.getItem('my_applications') : null;
              if (savedMyAppsStr) {
                try {
                  const arr = JSON.parse(savedMyAppsStr);
                  if (Array.isArray(arr) && arr.length > 0) {
                    localApps = arr.map((item: any) => {
                      const rawSt = String(item.status || item.rawStatus || '').toLowerCase().trim();
                      const rawTahap = String(item.stageText || item.tahapRekrutmen || item.tahapan || item.statusMessage || '').toLowerCase().trim();

                      let appSt: 'hired' | 'rejected' | 'in_progress' = 'in_progress';
                      if (
                        rawSt === 'rejected' || rawSt === 'ditolak' || rawSt === 'ditolak_sistem' ||
                        rawSt === 'tidak lolos' || rawSt === 'tidak_lolos' || rawSt === 'tidak-lolos' ||
                        rawTahap.includes('ditolak') || rawTahap.includes('tidak lolos') || rawTahap.includes('gagal')
                      ) {
                        appSt = 'rejected';
                      } else if (
                        rawSt === 'hired' || rawSt === 'diterima' || rawSt === 'accepted' ||
                        rawTahap.includes('diterima') || rawTahap.includes('diterima kerja') || rawTahap.includes('hired')
                      ) {
                        appSt = 'hired';
                      } else {
                        appSt = 'in_progress';
                      }

                      let stText = item.tahapRekrutmen || item.stageText || item.tahapan || item.statusMessage || 'Sedang Dalam Seleksi';
                      if (appSt === 'rejected') {
                        stText = item.catatanPerusahaan || item.catatan_perusahaan || stText || 'Ditolak / Tidak Lolos Seleksi';
                      } else if (appSt === 'hired') {
                        stText = 'Diterima Kerja';
                      }

                      return {
                        company: item.companyName || item.company || cv.targetCompany || '-',
                        role: item.jobTitle || item.role || cv.jobTitle || '-',
                        status: appSt,
                        stageText: stText,
                        poFitScore: item.cvScore || item.poFitScore || 0,
                        dateApplied: item.applyDate || item.dateApplied || item.tanggal_melamar || item.created_at || item.createdAt || item.date || 'Baru Saja',
                        video_url: localVideo,
                        videoUrl: localVideo,
                      };
                    });
                  }
                } catch (_) {}
              }

              if (localApps.length === 0) {
                const defaultSt = isLocalHired ? 'hired' : isLocalRejected ? 'rejected' : 'in_progress';
                localApps = [
                  {
                    company: cv.targetCompany || '-',
                    role: cv.jobTitle || '-',
                    status: defaultSt,
                    stageText: defaultSt === 'rejected' ? 'Ditolak / Tidak Lolos Seleksi' : defaultSt === 'hired' ? 'Diterima Kerja' : 'Sedang Proses Seleksi CV',
                    poFitScore: 0,
                    dateApplied: 'Baru Saja',
                    video_url: localVideo,
                    videoUrl: localVideo
                  }
                ];
              }

              const isLocalAnyHired = localApps.some(a => a.status === 'hired') || isLocalHired;
              const isLocalAnyInProgress = localApps.some(a => a.status === 'in_progress');
              const isLocalAnyRejected = localApps.some(a => a.status === 'rejected') || isLocalRejected;

              const computedLocalPrimaryStatus: 'hired' | 'rejected' | 'in_progress' = isLocalAnyHired
                ? 'hired'
                : isLocalAnyInProgress
                  ? 'in_progress'
                  : isLocalAnyRejected
                    ? 'rejected'
                    : 'in_progress';

              const liveStudent: StudentItem = {
                id: 'mhs-live',
                nim: cv.nim || '-',
                name: cv.fullName || 'Pelamar Terdaftar',
                major: majorName,
                gpa: parseFloat(matchedEd.gpa) || 0,
                batch: matchedEd.period ? matchedEd.period.split('-')[0].trim() : '-',
                email: cv.email,
                phone: cv.phone,
                location: cv.location,
                linkedinUrl: cv.linkedinUrl,
                portfolioUrl: cv.portfolioUrl,
                summary: cv.summary,
                experiences: cv.experiences,
                education: cv.education,
                categorizedSkills: cv.categorizedSkills,
                certifications: cv.certifications,
                primaryStatus: computedLocalPrimaryStatus,
                targetCompany: localApps[0]?.company || cv.targetCompany || '-',
                targetRole: localApps[0]?.role || cv.jobTitle || '-',
                avgPoFit: 0,
                cvFileName: `CV_${(cv.fullName || 'Pelamar').replace(/\s+/g, '_')}.pdf`,
                videoUrl: localVideo,
                videoDuration: localVideo ? '02:15' : '-',
                videoScores: localVideo ? { ability: 88, intelligent: 92, personality: 85, attitude: 90, emotionalIntelligence: 87 } : { ability: 0, intelligent: 0, personality: 0, attitude: 0, emotionalIntelligence: 0 },
                applications: localApps
              };
              const filtered = studentList.filter(s => s.id !== 'mhs-live');
              studentList.unshift(liveStudent);
            }
          } catch (_) { }
        }
      }

      setStudents(studentList);
    };

    if (typeof window !== 'undefined') {
      const handleStorageChange = () => {
        loadCampusStudents(currentCampus);
      };
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('focus', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('focus', handleStorageChange);
      };
    }
  }, []);

  // Dynamically extract unique majors from loaded candidate profiles' riwayat_pendidikan
  const availableMajors = Array.from(
    new Set(students.map(s => s.major).filter(m => m && m !== '-' && m !== 'Tanpa Jurusan'))
  );

  // Base filtering (Fakultas / Major, Search Query, Date Range) WITHOUT statusFilter
  const baseFilteredStudents = students.filter(s => {
    const matchesMajor = majorFilter === 'All' || s.major.toLowerCase().includes(majorFilter.toLowerCase());
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.targetCompany.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = (() => {
      if (!startDate && !endDate) return true;

      const parseDate = (dStr?: string): Date => {
        if (!dStr || dStr === 'Terbaru' || dStr === 'Baru Saja') {
          return new Date();
        }
        if (dStr.includes('-')) {
          const parsed = new Date(dStr);
          if (!isNaN(parsed.getTime())) return parsed;
        }
        if (dStr.includes('/')) {
          const parts = dStr.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const parsed = new Date(year, month, day);
            if (!isNaN(parsed.getTime())) return parsed;
          }
        }
        const parsedDirect = new Date(dStr);
        if (!isNaN(parsedDirect.getTime())) return parsedDirect;

        return new Date();
      };

      const sD = startDate ? new Date(startDate) : null;
      if (sD) sD.setHours(0, 0, 0, 0);

      const eD = endDate ? new Date(endDate) : null;
      if (eD) eD.setHours(23, 59, 59, 999);

      if (!s.applications || s.applications.length === 0) {
        const appDate = parseDate();
        if (sD && appDate < sD) return false;
        if (eD && appDate > eD) return false;
        return true;
      }

      return s.applications.some((app) => {
        const appDate = parseDate(app.dateApplied);
        if (sD && appDate < sD) return false;
        if (eD && appDate > eD) return false;
        return true;
      });
    })();

    return matchesMajor && matchesSearch && matchesDate;
  });

  // Final filtered list for table (includes statusFilter)
  const filteredStudents = baseFilteredStudents.filter(s => {
    return statusFilter === 'all' || s.primaryStatus === statusFilter;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedStudents = filteredStudents.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  // Dynamic tab counts based on currently selected Major, Search Query, and Date Range
  const countAll = baseFilteredStudents.length;
  const countHired = baseFilteredStudents.filter(s => s.primaryStatus === 'hired').length;
  const countInProgress = baseFilteredStudents.filter(s => s.primaryStatus === 'in_progress').length;
  const countRejected = baseFilteredStudents.filter(s => s.primaryStatus === 'rejected').length;

  const openStudentModal = (student: StudentItem) => {
    let activeStudent = student;
    if (typeof window !== 'undefined') {
      const cvStr = localStorage.getItem('candidateCvData');
      if (cvStr) {
        try {
          const cv = JSON.parse(cvStr);
          if (student.id === 'mhs-live' || (cv.fullName && cv.fullName === student.name) || (cv.email && cv.email === student.email)) {
            const edList = cv.education || [];
            const matchedEd = edList[0] || {};
            const rawMajor = matchedEd.degree || matchedEd.major || matchedEd.jurusan || cv.jobTitle || student.major;
            activeStudent = {
              ...student,
              name: cv.fullName || student.name,
              major: normalizeMajorName(rawMajor),
              gpa: parseFloat(matchedEd.gpa) || student.gpa,
              email: cv.email || student.email,
              phone: cv.phone || student.phone,
              location: cv.location || student.location,
              linkedinUrl: cv.linkedinUrl || student.linkedinUrl,
              portfolioUrl: cv.portfolioUrl || student.portfolioUrl,
              summary: cv.summary || student.summary,
              experiences: cv.experiences || student.experiences,
              education: cv.education || student.education,
              categorizedSkills: cv.categorizedSkills || student.categorizedSkills,
              certifications: cv.certifications || student.certifications,
            };
          }
        } catch (_) {}
      }
    }
    setSelectedStudent(activeStudent);
    setModalTab('applications');
    setIsPlayingVideo(false);
  };

  const handleExportStudentsPdf = () => {
    const fileName = `Laporan_Rekrutmen_Mahasiswa_${campusName.replace(/\s+/g, '_')}.pdf`;
    const pdfEsc = (str: string) => (str || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

    const streamLines: string[] = [];
    let y = 790;

    const filterFakultasLabel = majorFilter === 'All' ? 'Semua Fakultas' : majorFilter;
    const filterStatusLabel = statusFilter === 'hired' ? 'Diterima Kerja' : statusFilter === 'rejected' ? 'Belum Lolos' : statusFilter === 'in_progress' ? 'Dalam Seleksi' : 'Semua Status';
    
    const formatDateDisplay = (dStr: string) => {
      if (!dStr) return '';
      const parts = dStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dStr;
    };
    const filterPeriodeLabel = (startDate || endDate)
      ? `${formatDateDisplay(startDate) || 'Awal'} s.d. ${formatDateDisplay(endDate) || 'Hari Ini'}`
      : 'Semua Tanggal';

    // Header Title
    streamLines.push(`BT /F1 15 Tf 50 ${y} Td (${pdfEsc(`LAPORAN REKRUTMEN MAHASISWA & ALUMNI`)}) Tj ET`);
    y -= 18;
    streamLines.push(`BT /F1 11 Tf 50 ${y} Td (${pdfEsc(`Pusat Karir ${campusName}`)}) Tj ET`);
    y -= 15;
    streamLines.push(`BT /F1 8.5 Tf 50 ${y} Td (${pdfEsc(`Fakultas: ${filterFakultasLabel}   |   Status: ${filterStatusLabel}   |   Periode: ${filterPeriodeLabel}`)}) Tj ET`);
    y -= 14;
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    streamLines.push(`BT /F2 8.5 Tf 50 ${y} Td (${pdfEsc(`Tanggal Ekspor: ${todayStr}   |   Total Data: ${filteredStudents.length} Mahasiswa`)}) Tj ET`);
    y -= 14;

    // Header Divider Line
    streamLines.push(`0.5 w 50 ${y} m 545 ${y} l S`);
    y -= 22;

    // Table Header Background Box
    streamLines.push(`0.92 g 50 ${y - 4} 495 18 re f 0 g`);

    // Table Header Text
    streamLines.push(`BT /F1 8 Tf 55 ${y} Td (NO) Tj ET`);
    streamLines.push(`BT /F1 8 Tf 75 ${y} Td (NAMA MAHASISWA) Tj ET`);
    streamLines.push(`BT /F1 8 Tf 190 ${y} Td (PROGRAM STUDI) Tj ET`);
    streamLines.push(`BT /F1 8 Tf 315 ${y} Td (IPK) Tj ET`);
    streamLines.push(`BT /F1 8 Tf 345 ${y} Td (PERUSAHAAN & POSISI) Tj ET`);
    streamLines.push(`BT /F1 8 Tf 485 ${y} Td (STATUS) Tj ET`);

    y -= 18;
    streamLines.push(`0.25 w 50 ${y + 12} m 545 ${y + 12} l S`);

    // Table Rows
    filteredStudents.forEach((st, index) => {
      if (y < 60) return; // simple safety boundary for 1-page table export
      const numStr = `${index + 1}`;
      const nameFull = st.name.length > 28 ? st.name.slice(0, 27) + '...' : st.name;
      const majorFull = st.major.length > 28 ? st.major.slice(0, 27) + '...' : st.major;
      const gpaStr = st.gpa ? st.gpa.toFixed(2) : '-';
      const companyFull = st.targetCompany && st.targetCompany !== '-'
        ? (st.targetCompany.length > 32 ? st.targetCompany.slice(0, 31) + '...' : st.targetCompany)
        : '-';
      const roleFull = st.targetRole && st.targetRole !== '-'
        ? (st.targetRole.length > 34 ? st.targetRole.slice(0, 33) + '...' : st.targetRole)
        : '';
      const statusStr = st.primaryStatus === 'hired' ? 'Diterima Kerja' : st.primaryStatus === 'rejected' ? 'Belum Lolos' : 'Dalam Seleksi';

      streamLines.push(`BT /F2 8 Tf 55 ${y} Td (${pdfEsc(numStr)}) Tj ET`);
      streamLines.push(`BT /F1 8 Tf 75 ${y} Td (${pdfEsc(nameFull)}) Tj ET`);
      streamLines.push(`BT /F2 8 Tf 190 ${y} Td (${pdfEsc(majorFull)}) Tj ET`);
      streamLines.push(`BT /F1 8 Tf 315 ${y} Td (${pdfEsc(gpaStr)}) Tj ET`);

      // Company Name (Full on Line 1) & Position Title (Full on Line 2)
      streamLines.push(`BT /F1 8 Tf 345 ${y} Td (${pdfEsc(companyFull)}) Tj ET`);
      if (roleFull) {
        streamLines.push(`BT /F2 7 Tf 345 ${y - 9} Td (${pdfEsc(roleFull)}) Tj ET`);
      }

      streamLines.push(`BT /F1 8 Tf 485 ${y} Td (${pdfEsc(statusStr)}) Tj ET`);

      y -= 24;
      streamLines.push(`0.1 w 50 ${y + 12} m 545 ${y + 12} l S`);
    });

    // Footer
    y -= 10;
    streamLines.push(`0.5 w 50 ${y} m 545 ${y} l S`);
    y -= 14;
    streamLines.push(`BT /F2 8 Tf 50 ${y} Td (${pdfEsc(`Dokumen Resmi Laporan Perekrutan Mahasiswa • Pusat Karir ${campusName}`)}) Tj ET`);
    streamLines.push(`BT /F2 8 Tf 462 ${y} Td (${pdfEsc(`Ref: LAP-MHS-${new Date().getTime().toString().slice(-6)}`)}) Tj ET`);

    const streamContent = streamLines.join('\n');
    const streamLength = streamContent.length;

    const objects = [
      `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
      `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`,
      `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`,
      `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
      `6 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`
    ];

    let header = '%PDF-1.4\n';
    let offsets: number[] = [];
    let currentOffset = header.length;

    objects.forEach(obj => {
      offsets.push(currentOffset);
      currentOffset += obj.length;
    });

    const xrefOffset = currentOffset;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
      xref += `${String(offsets[i - 1]).padStart(10, '0')} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    const fullPdf = header + objects.join('') + xref + trailer;

    const blob = new Blob([fullPdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Laporan PDF ${fileName} berhasil diunduh!`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {t.kampus?.studentsTitle || 'Status Rekrutmen Mahasiswa'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.kampus?.studentsSubtitle || 'Status penerimaan kerja mahasiswa secara real-time di berbagai perusahaan.'}
          </p>
        </div>

        <button
          onClick={handleExportStudentsPdf}
          className="px-4 py-2 bg-card border border-border hover:bg-muted text-foreground font-semibold text-xs rounded-xl transition-all flex items-center gap-2 shadow-2xs shrink-0 cursor-pointer"
          title="Ekspor Laporan Rekrutmen Mahasiswa ke PDF"
        >
          <Download size={16} className="text-muted-foreground" />
          Ekspor PDF Mahasiswa
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-card p-4 sm:p-5 rounded-xl border border-border shadow-sm space-y-4">

        {/* Row 1: Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar border-b border-border/60 pb-3">
          {[
            { id: 'all', label: 'Semua Mahasiswa', count: countAll },
            { id: 'hired', label: 'Diterima Kerja', count: countHired },
            { id: 'in_progress', label: 'Dalam Seleksi', count: countInProgress },
            { id: 'rejected', label: 'Belum Lolos', count: countRejected },
          ].map(tab => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id as typeof statusFilter);
                  updateUrlParams({ status: tab.id });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${isActive
                  ? 'bg-[#1A4B9F] text-white border-[#1A4B9F] shadow-xs'
                  : 'bg-muted/40 text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/80'
                  }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-background text-muted-foreground border border-border/50'
                  }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Search Input, Dropdown & Date Range Filters (Auto Filter) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
          {/* Search Input (Expanded & Instant Filter) */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                const val = e.target.value;
                setSearchInput(val);
                setSearchQuery(val.trim());
                updateUrlParams({ keyword: val.trim(), major: majorFilter, status: statusFilter, startDate, endDate });
              }}
              placeholder="Cari nama, jurusan, perusahaan..."
              className="w-full pl-9 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-[#1A4B9F] font-medium"
            />
          </div>

          {/* Dropdown Fakultas */}
          <select
            value={majorFilter}
            onChange={(e) => {
              setMajorFilter(e.target.value);
              updateUrlParams({ keyword: searchQuery, major: e.target.value, status: statusFilter, startDate, endDate });
            }}
            className="px-3.5 py-2.5 bg-muted/30 border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-[#1A4B9F] cursor-pointer shrink-0"
          >
            <option value="All">Semua Fakultas ({students.length})</option>
            {availableMajors.map((m, idx) => (
              <option key={idx} value={m}>{m}</option>
            ))}
          </select>

          {/* Date Range Picker (DD/MM/YYYY - Auto Filter) */}
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus-within:border-[#1A4B9F] shrink-0">
            <Calendar size={15} className="text-muted-foreground shrink-0" />
            <div className="relative flex items-center">
              <input
                type="date"
                value={startDate}
                onClick={(e) => { try { (e.currentTarget as any).showPicker?.(); } catch (_) {} }}
                onChange={(e) => {
                  const val = e.target.value;
                  setStartDate(val);
                  updateUrlParams({ keyword: searchQuery, major: majorFilter, status: statusFilter, startDate: val, endDate });
                }}
                className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer p-0 border-none w-28 text-center font-medium [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                title="Tanggal Mulai (dd/mm/yyyy)"
              />
            </div>
            <div className="flex items-center gap-1 text-muted-foreground font-semibold text-[10px] bg-muted/60 px-1.5 py-0.5 rounded-md shrink-0">
              <ArrowRight size={11} className="text-muted-foreground" />
              <span>s.d.</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="date"
                value={endDate}
                onClick={(e) => { try { (e.currentTarget as any).showPicker?.(); } catch (_) {} }}
                onChange={(e) => {
                  const val = e.target.value;
                  setEndDate(val);
                  updateUrlParams({ keyword: searchQuery, major: majorFilter, status: statusFilter, startDate, endDate: val });
                }}
                className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer p-0 border-none w-28 text-center font-medium [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                title="Tanggal Akhir (dd/mm/yyyy)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground border-b border-border font-bold">
                <th className="px-4 py-3.5 align-middle w-[25%] font-bold">NAMA MAHASISWA</th>
                <th className="px-4 py-3.5 align-middle w-[23%] font-bold">FAKULTAS / JURUSAN</th>
                <th className="px-4 py-3.5 align-middle w-[10%] font-bold text-center">IPK</th>
                <th className="px-4 py-3.5 align-middle w-[22%] font-bold">PERUSAHAAN TARGET & POSISI</th>
                <th className="px-4 py-3.5 align-middle w-[12%] font-bold text-center">STATUS REKRUTMEN</th>
                <th className="px-4 py-3.5 align-middle w-[8%] font-bold text-right">AKSI / MEDIA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">
                    <GraduationCap size={32} className="mx-auto mb-2 opacity-50 text-[#1A4B9F]" />
                    <p className="font-bold text-sm text-foreground">Belum Ada Mahasiswa Terdaftar untuk {campusName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Data mahasiswa akan otomatis muncul saat pelamar mencantumkan <strong className="text-foreground">{campusName}</strong> pada riwayat pendidikan (riwayat_pendidikan) CV mereka.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">

                    {/* Name + Avatar */}
                    <td className="px-4 py-3.5 align-middle font-bold text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-[#1A4B9F] dark:text-blue-300 font-bold flex items-center justify-center text-xs border border-blue-300 shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground">Angkatan {s.batch}</p>
                        </div>
                      </div>
                    </td>

                    {/* Fakultas */}
                    <td className="px-4 py-3.5 align-middle font-medium text-foreground">{s.major}</td>

                    {/* GPA */}
                    <td className="px-4 py-3.5 align-middle text-center font-bold text-[#1A4B9F] dark:text-blue-400">{s.gpa ? s.gpa : '-'}</td>

                    {/* Target Company & Role */}
                    <td className="px-4 py-3.5 align-middle">
                      {(!s.targetCompany || s.targetCompany === '-') && (!s.targetRole || s.targetRole === '-') ? (
                        <span className="text-muted-foreground font-semibold text-xs">-</span>
                      ) : (
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{s.targetCompany}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{s.targetRole}</p>
                        </div>
                      )}
                    </td>

                    {/* Recruitment Status Badge */}
                    <td className="px-4 py-3 align-middle text-center">
                      {s.primaryStatus === 'hired' && (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-950 font-bold border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700 text-[10px] rounded-full inline-flex items-center gap-1 shadow-2xs whitespace-nowrap">
                          <CheckCircle2 size={11} className="text-emerald-700 dark:text-emerald-400" />
                          Diterima Kerja
                        </span>
                      )}
                      {s.primaryStatus === 'in_progress' && (
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-950 font-bold border border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-700 text-[10px] rounded-full inline-flex items-center gap-1 shadow-2xs whitespace-nowrap">
                          <Clock size={11} className="text-blue-700 dark:text-blue-400" />
                          Sedang Dalam Seleksi
                        </span>
                      )}
                      {s.primaryStatus === 'rejected' && (
                        <span className="px-2.5 py-0.5 bg-rose-100 text-rose-950 font-bold border border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700 text-[10px] rounded-full inline-flex items-center gap-1 shadow-2xs whitespace-nowrap">
                          <XCircle size={11} className="text-rose-700 dark:text-rose-400" />
                          Belum Lolos
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openStudentModal(s)}
                          className="px-2.5 py-1 bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-[11px] rounded-lg transition-all inline-flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap"
                        >
                          <Eye size={12} />
                          Lihat CV & Video
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredStudents.length > 0 && (
          <Pagination
            currentPage={safeCurrentPage}
            totalItems={filteredStudents.length}
            pageSize={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      {/* Student Detail Modal (CV, Video & Recruitment History) */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground border border-border rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">

            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1A4B9F] text-white font-bold text-lg flex items-center justify-center border border-blue-400 shadow-md">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{selectedStudent.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    NIM: <strong className="font-mono text-foreground">{selectedStudent.nim}</strong> &bull; {selectedStudent.major} (Angkatan {selectedStudent.batch})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-border gap-2 overflow-x-auto">
              {[
                { id: 'applications', label: 'Riwayat Lamaran Perusahaan', icon: Building2 },
                { id: 'cv', label: 'Berkas CV Mahasiswa', icon: FileText },
                { id: 'video', label: 'Rekaman Video Wawancara AI', icon: Video },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = modalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(tab.id as typeof modalTab)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap -mb-px ${isActive
                      ? 'border-[#1A4B9F] text-[#1A4B9F] bg-blue-50/50 dark:bg-blue-950/30 rounded-t-lg'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ==================== TAB 1: APPLICATIONS HISTORY ==================== */}
            {modalTab === 'applications' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* GPA & AI Fit Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/40 border border-border rounded-xl">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">IPK Mahasiswa</span>
                    <span className="text-xl font-bold text-[#1A4B9F] dark:text-blue-400">{selectedStudent.gpa} / 4.00</span>
                  </div>
                  <div className="p-4 bg-muted/40 border border-border rounded-xl">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Rata-Rata Skor AI PO-FIT</span>
                    <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{selectedStudent.avgPoFit}% Match</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {selectedStudent.applications.map((app, idx) => (
                    <div key={idx} className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-sm text-foreground">{app.company}</h5>
                          <p className="text-xs text-muted-foreground">{app.role}</p>
                        </div>

                        {app.status === 'hired' && (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-950 font-bold border border-emerald-300 text-[10px] rounded-full">
                            ✓ Diterima
                          </span>
                        )}
                        {app.status === 'in_progress' && (
                          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-950 font-bold border border-blue-300 text-[10px] rounded-full">
                            ⏳ Dalam Seleksi
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-950 font-bold border border-rose-300 text-[10px] rounded-full">
                            ✗ Belum Lolos
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground font-medium pt-1 border-t border-border/60">
                        Status Detail: <strong className="text-foreground">{app.stageText}</strong> &bull; Melamar: {app.dateApplied}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ==================== TAB 2: CV DOCUMENT PREVIEW ==================== */}
            {modalTab === 'cv' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#1A4B9F] dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-foreground">{selectedStudent.cvFileName}</h5>
                      <p className="text-[11px] text-muted-foreground">Dokumen CV Resmi ATS Mahasiswa &bull; PDF (Direct PDF File)</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadCv(selectedStudent)}
                    className="px-3.5 py-1.5 bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
                  >
                    <Download size={14} />
                    Unduh CV
                  </button>
                </div>

                {/* Printable ATS Template Render Card (EXACT Applicant ATS Layout) */}
                <div id="printable-ats-cv" className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-300 shadow-xl text-slate-800 space-y-6 font-serif dark:bg-white dark:text-slate-900 max-h-[480px] overflow-y-auto custom-scrollbar">

                  {/* ATS Header */}
                  <div className="border-b-2 border-slate-800 pb-4 space-y-1 text-center font-sans">
                    <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
                      {selectedStudent.name}
                    </h2>
                    <span className="text-sm font-bold text-slate-900 block">
                      {selectedStudent.targetRole && selectedStudent.targetRole !== '-' ? selectedStudent.targetRole : selectedStudent.major}
                    </span>
                    <div className="text-[11px] text-slate-600 flex items-center justify-center flex-wrap gap-2 pt-1 font-medium">
                      <span>{selectedStudent.email || `${selectedStudent.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`}</span> •{' '}
                      <span>{selectedStudent.phone || `0812${selectedStudent.nim.replace(/[^0-9]/g, '').slice(-8) || '87654321'}`}</span> •{' '}
                      <span>{selectedStudent.location || 'Jakarta, Indonesia'}</span>
                      {selectedStudent.linkedinUrl ? (
                        <> • <span className="font-bold text-slate-900">LinkedIn: {selectedStudent.linkedinUrl}</span></>
                      ) : (
                        <> • <span className="font-bold text-slate-900">LinkedIn: linkedin.com/in/{selectedStudent.name.toLowerCase().replace(/\s+/g, '')}</span></>
                      )}
                      {selectedStudent.portfolioUrl && (
                        <> • <span className="font-bold text-slate-900">Portofolio: {selectedStudent.portfolioUrl}</span></>
                      )}
                    </div>
                  </div>

                  {/* ATS Summary */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-sans">
                      RINGKASAN PROFESIONAL
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans text-justify">
                      {selectedStudent.summary || `Mahasiswa aktif berprestasi dari ${selectedStudent.major} di ${campusName} dengan IPK ${selectedStudent.gpa}. Memiliki pemahaman mendalam dalam rekayasa perangkat lunak, arsitektur sistem modern, serta analisis data rekrutmen. Berpengalaman memimpin proyek tim dan siap berkontribusi secara profesional di dunia industri.`}
                    </p>
                  </div>

                  {/* ATS Experience */}
                  <div className="space-y-3 font-sans">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      PENGALAMAN KERJA
                    </h3>
                    {selectedStudent.experiences && selectedStudent.experiences.length > 0 ? (
                      selectedStudent.experiences.map((exp, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                            <span>{exp.role || '[Posisi]'} — {exp.company || '[Perusahaan]'}</span>
                            <span className="text-[11px] text-slate-500 font-semibold">{exp.period}</span>
                          </div>
                          {exp.description && (
                            <p className="text-xs text-slate-600 leading-normal pl-3 border-l-2 border-slate-200 text-justify">
                              • {exp.description}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="space-y-1">
                          <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                            <span>Software Engineer Intern — PT Solusi Teknologi Utama</span>
                            <span className="text-[11px] text-slate-500 font-semibold">Jan 2026 - Jun 2026</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-normal pl-3 border-l-2 border-slate-200 text-justify">
                            • Mengembangkan komponen frontend dashboard rekrutmen menggunakan React.js & TypeScript, memangkas waktu pemrosesan data hingga 35%.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                            <span>Asisten Praktikum Laboratorium — {campusName}</span>
                            <span className="text-[11px] text-slate-500 font-semibold">Aug 2025 - Dec 2025</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-normal pl-3 border-l-2 border-slate-200 text-justify">
                            • Membimbing 60+ mahasiswa dalam praktikum algoritma, pemrograman berorientasi objek, dan manajemen basis data.
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* ATS Education */}
                  <div className="space-y-2 font-sans">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      PENDIDIKAN
                    </h3>
                    {selectedStudent.education && selectedStudent.education.length > 0 ? (
                      selectedStudent.education.map((edu, idx) => (
                        <div key={idx} className="flex justify-between items-baseline text-xs">
                          <span className="font-bold text-slate-900">
                            {edu.degree || selectedStudent.major} — {edu.school || campusName} {edu.gpa ? `(${edu.gpa})` : `(IPK ${selectedStudent.gpa})`}
                          </span>
                          <span className="text-[11px] text-slate-500">{edu.period || `20${selectedStudent.batch} - Sekarang`}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="font-bold text-slate-900">
                          {selectedStudent.major} — {campusName} (IPK {selectedStudent.gpa} / 4.00)
                        </span>
                        <span className="text-[11px] text-slate-500">20{selectedStudent.batch} - Sekarang</span>
                      </div>
                    )}
                  </div>

                  {/* ATS Skills */}
                  <div className="space-y-1.5 font-sans">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      KEAHLIAN TEKNIS & SERTIFIKASI
                    </h3>
                    <div className="text-xs text-slate-700 leading-relaxed text-justify">
                      <strong className="text-slate-900 block mb-1">Keahlian:</strong>
                      {selectedStudent.categorizedSkills && selectedStudent.categorizedSkills.length > 0 ? (
                        <ul className="space-y-1 list-disc pl-4 marker:text-slate-400">
                          {selectedStudent.categorizedSkills.filter(s => s.category || s.items).map((s, idx) => (
                            <li key={idx} className="text-xs">
                              <strong className="text-slate-800">{s.category}:</strong> {s.items}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="space-y-1 list-disc pl-4 marker:text-slate-400">
                          <li className="text-xs"><strong className="text-slate-800">Programming Languages:</strong> TypeScript, JavaScript, Python, SQL</li>
                          <li className="text-xs"><strong className="text-slate-800">Frameworks & Libraries:</strong> React.js, Next.js, Node.js, Tailwind CSS</li>
                          <li className="text-xs"><strong className="text-slate-800">Databases & Tools:</strong> PostgreSQL, REST API, Git & GitHub, Docker</li>
                        </ul>
                      )}
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed mt-2">
                      <strong className="text-slate-900">Sertifikasi:</strong>{' '}
                      {selectedStudent.certifications && selectedStudent.certifications.length > 0 ? (
                        <ul className="mt-1 space-y-0.5 list-none pl-0">
                          {selectedStudent.certifications.filter(c => c.name.trim()).map((cert, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                              <span>{cert.name}</span>
                              {cert.credentialUrl && (
                                <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-slate-900 font-bold underline text-[10px] ml-1">[Lihat Kredensial]</a>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="mt-1 space-y-0.5 list-none pl-0">
                          <li className="flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                            <span>AWS Certified Cloud Practitioner &bull; Amazon Web Services</span>
                            <span className="text-slate-900 font-bold underline text-[10px] ml-1">[Lihat Kredensial]</span>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                            <span>Sertifikasi Kompetensi Nasional &bull; BNSP Indonesia</span>
                            <span className="text-slate-900 font-bold underline text-[10px] ml-1">[Lihat Kredensial]</span>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Verification Stamp */}
                  <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500 font-sans">
                    <span>Dokumen Digital Resmi &bull; Pusat Karir {campusName}</span>
                    <span>Ref ID: CV-ATS-{selectedStudent.id}-{selectedStudent.batch}</span>
                  </div>

                </div>
              </div>
            )}

            {/* ==================== TAB 3: VIDEO RECORDING PREVIEW ==================== */}
            {modalTab === 'video' && (
              <div className="space-y-5 animate-in fade-in duration-200">

                {(() => {
                  const rawVideoUrl = selectedStudent.videoPlaybackUrl || selectedStudent.videoUrl ||
                    (selectedStudent.applications && selectedStudent.applications.find(a => a.video_playback_url || a.videoPlaybackUrl)?.video_playback_url) ||
                    (selectedStudent.applications && selectedStudent.applications.find(a => a.video_url || a.videoUrl)?.video_url) ||
                    (selectedStudent.applications && selectedStudent.applications.find(a => a.video_url || a.videoUrl)?.videoUrl);

                  if (!rawVideoUrl || rawVideoUrl === 'null' || rawVideoUrl === 'undefined' || !rawVideoUrl.trim()) {
                    return (
                      <div className="relative aspect-video bg-muted/30 rounded-2xl border border-border flex flex-col items-center justify-center p-6 text-center space-y-2">
                        <VideoOff size={32} className="text-muted-foreground/60 mb-1" />
                        <h4 className="text-sm font-semibold text-foreground">
                          Belum Mengunggah Rekaman Video
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          Pelamar belum mengunggah rekaman video wawancara.
                        </p>
                      </div>
                    );
                  }

                  const resolveVideoUrl = (url: string): string => {
                    if (!url) return '';
                    if (url.includes('r2.dev')) {
                      const appId = (selectedStudent.applications && selectedStudent.applications.find(a => a.video_url || a.videoUrl)?.id) || selectedStudent.applications?.[0]?.id;
                      if (appId) {
                        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                        return `${apiBase.replace(/\/$/, '')}/api/applications/${appId}/video`;
                      }
                    }
                    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
                      return url;
                    }
                    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                    return `${apiBase.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
                  };

                  const finalVideoUrl = resolveVideoUrl(rawVideoUrl);

                  return (
                    <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-border shadow-xl group flex items-center justify-center">
                      {isPlayingVideo ? (
                        <video
                          key={finalVideoUrl}
                          src={finalVideoUrl}
                          controls
                          autoPlay
                          playsInline
                          className="w-full h-full object-contain bg-black"
                        />
                      ) : (
                        <div
                          className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer bg-slate-900/90 hover:bg-slate-900 transition-colors p-4"
                          onClick={() => setIsPlayingVideo(true)}
                        >
                          <div className="w-16 h-16 rounded-full bg-[#1A4B9F] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3">
                            <Play size={28} className="ml-1" />
                          </div>
                          <p className="text-sm font-bold text-white mb-1">
                            Putar Rekaman Video Wawancara Virtual
                          </p>
                          <p className="text-xs text-slate-400">
                            Durasi Rekaman: {selectedStudent.videoDuration} &bull; Klik untuk memutar video
                          </p>

                          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] text-white/80 font-mono bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-lg">
                            <span>00:00 / {selectedStudent.videoDuration}</span>
                            <span>1080p FHD &bull; 48kHz Audio</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {(() => {
                  const rawVidCheck = selectedStudent.videoPlaybackUrl || selectedStudent.videoUrl ||
                    (selectedStudent.applications && selectedStudent.applications.find(a => a.video_playback_url || a.videoPlaybackUrl)?.video_playback_url) ||
                    (selectedStudent.applications && selectedStudent.applications.find(a => a.video_url || a.videoUrl)?.video_url) ||
                    (selectedStudent.applications && selectedStudent.applications.find(a => a.video_url || a.videoUrl)?.videoUrl);
                  const hasVideo = Boolean(rawVidCheck && rawVidCheck !== 'null' && rawVidCheck !== 'undefined' && rawVidCheck.trim() !== '');

                  const gestures = selectedStudent.aiResult?.parameter_analisis;
                  const questions = selectedStudent.aiResult?.analisis_pertanyaan;

                  return (
                    <>
                      {/* 5 Video Parameter Scores */}
                      <div className="space-y-3">
                        <h5 className="font-bold text-xs text-foreground uppercase tracking-wider">Hasil Ekstraksi 5 Parameter Gestur Video AI</h5>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {[
                            { key: 'ability', label: 'Ability', score: selectedStudent.videoScores?.ability },
                            { key: 'intelligent', label: 'Intelligent', score: selectedStudent.videoScores?.intelligent },
                            { key: 'personality', label: 'Personality', score: selectedStudent.videoScores?.personality },
                            { key: 'attitude', label: 'Attitude', score: selectedStudent.videoScores?.attitude },
                            { key: 'emotionalIntelligence', label: 'Emotional Eq.', score: selectedStudent.videoScores?.emotionalIntelligence },
                          ].map(param => (
                            <div key={param.key} className="p-2.5 bg-muted/30 border border-border rounded-xl text-center">
                              <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">{param.label}</p>
                              <span className="text-base font-bold text-[#1A4B9F] dark:text-blue-400">
                                {hasVideo && param.score && param.score > 0 ? `${param.score}%` : '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                        {!hasVideo && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic text-center">
                            * Ekstraksi gestur AI belum diproses karena pelamar belum mengunggah video wawancara.
                          </p>
                        )}
                      </div>

                      {/* Gestur Visual Pelamar (Jika Tersedia di AI Result) */}
                      {hasVideo && gestures && (
                        <div className="space-y-2 p-3 bg-muted/20 border border-border rounded-xl">
                          <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                            Detail Gestur & Gerakan Pelamar
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="p-2 bg-background border border-border rounded-lg text-center">
                              <span className="text-[10px] text-muted-foreground block">Kontak Mata</span>
                              <span className="text-xs font-bold text-foreground">{gestures.kontak_mata ? `${gestures.kontak_mata}%` : '-'}</span>
                            </div>
                            <div className="p-2 bg-background border border-border rounded-lg text-center">
                              <span className="text-[10px] text-muted-foreground block">Gerakan Badan</span>
                              <span className="text-xs font-bold text-foreground">{gestures.gerakan_badan ? `${gestures.gerakan_badan}%` : '-'}</span>
                            </div>
                            <div className="p-2 bg-background border border-border rounded-lg text-center">
                              <span className="text-[10px] text-muted-foreground block">Gerakan Kepala</span>
                              <span className="text-xs font-bold text-foreground">{gestures.gerakan_kepala ? `${gestures.gerakan_kepala}%` : '-'}</span>
                            </div>
                            <div className="p-2 bg-background border border-border rounded-lg text-center">
                              <span className="text-[10px] text-muted-foreground block">Gerakan Tangan</span>
                              <span className="text-xs font-bold text-foreground">{gestures.gerakan_tangan ? `${gestures.gerakan_tangan}%` : '-'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Evaluasi Pertanyaan Wawancara (Jika Tersedia) */}
                      {hasVideo && Array.isArray(questions) && questions.length > 0 && (
                        <div className="space-y-2.5">
                          <h6 className="font-bold text-xs text-foreground uppercase tracking-wider">
                            Evaluasi Jawaban Tiap Pertanyaan ({questions.length} Pertanyaan)
                          </h6>
                          <div className="space-y-2">
                            {questions.map((q: any, idx: number) => (
                              <div key={idx} className="p-3 bg-muted/20 border border-border rounded-xl space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-foreground">{idx + 1}. {q.pertanyaan || `Pertanyaan ${idx + 1}`}</span>
                                  {q.skor_relevansi && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-[#1A4B9F] dark:text-blue-300 rounded-full">
                                      Skor: {q.skor_relevansi}%
                                    </span>
                                  )}
                                </div>
                                {q.ringkasan && (
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {q.ringkasan}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Video Transcript Excerpt */}
                      <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-1.5">
                        <h6 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <FileCheck size={14} className="text-[#1A4B9F]" />
                          Sorotan Transkrip Jawaban Wawancara
                        </h6>
                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                          {hasVideo
                            ? (selectedStudent.videoTranscript 
                                ? `"${selectedStudent.videoTranscript}"` 
                                : `Transkrip wawancara sedang diproses atau tidak tersedia untuk video ini.`)
                            : `Belum ada transkrip wawancara. Transkrip akan dibuat otomatis oleh sistem setelah pelamar mengunggah video wawancara.`}
                        </p>
                      </div>
                    </>
                  );
                })()}

              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function KampusMahasiswaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A4B9F]"></div></div>}>
      <KampusMahasiswaContent />
    </Suspense>
  );
}
