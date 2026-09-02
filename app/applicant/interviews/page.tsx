'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import api from '@/lib/api';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Square,
  Send,
  Settings2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Volume2,
  CheckCircle2,
  UserCheck,
  HelpCircle
} from 'lucide-react';

export default function WawancaraVideoPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  // States untuk fitur Upload (Alternative)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const questions = [
    {
      id: 1,
      category: 'Pengalaman & Kepemimpinan',
      question: 'Ceritakan situasi saat Anda mengalami perbedaan pendapat dengan anggota tim terkait pekerjaan teknis. Bagaimana cara Anda menyelesaikannya dan memastikan hasil terbaik bagi tim?',
      tip: 'Tips Wawancara: Jelaskan situasi secara singkat, tindakan yang Anda ambil, serta hasil positif yang dicapai.'
    },
    {
      id: 2,
      category: 'Penyelesaian Masalah & Adaptasi',
      question: 'Bagaimana pendekatan Anda ketika dihadapkan pada tenggat waktu yang sangat ketat namun terjadi perubahan spesifikasi kebutuhan secara mendadak?',
      tip: 'Tips Wawancara: Fokus pada bagaimana Anda menetapkan prioritas dan berkomunikasi dengan pemangku kepentingan.'
    },
    {
      id: 3,
      category: 'Budaya Kerja & Nilai Profesional',
      question: 'Nilai-nilai profesional apa yang paling penting bagi Anda dalam lingkungan kerja, dan bagaimana Anda menerapkannya saat bekerja dalam tim?',
      tip: 'Tips Wawancara: Berikan contoh nyata tentang integritas, kerjasama tim, dan rasa saling menghargai.'
    }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleFinishAssessment = () => {
    router.push('/applicant/status');
  };

  const handleUploadSubmit = async () => {
    if (!selectedVideo) {
      alert("Pilih file video .mp4 terlebih dahulu!");
      return;
    }

    const isConfirmed = window.confirm("Apakah Anda yakin ingin menggunakan video ini?\n\nPerhatian: Anda hanya dapat mengunggah video SATU KALI untuk lamaran ini. Pastikan video yang Anda pilih sudah benar.");
    if (!isConfirmed) {
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('video', selectedVideo);

      const appId = localStorage.getItem('current_application_id') || 'DUMMY_ID';
      await api.post(`/applications/${appId}/upload-video`, formData);
      alert("Video Anda berhasil diunggah! Data Anda telah dikirim dan akan segera direview oleh tim rekrutmen perusahaan.");
      router.push('/applicant/status');
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengunggah video.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-[#C2E5EF] dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/applicant/upload-cv"
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#1b7b9e] dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Kembali"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#1b7b9e] dark:text-cyan-400">
              {t.pelamar.wawancara.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.pelamar.wawancara.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E0F1F7] dark:bg-slate-800 border border-[#B8E1ED] dark:border-slate-700 text-[#1b7b9e] dark:text-cyan-400 text-xs sm:text-sm font-bold">
            <Sparkles className="w-4 h-4 text-[#1b7b9e] dark:text-cyan-400" />
            <span>{t.pelamar.wawancara.questionPrefix} {currentQuestionIndex + 1} {t.pelamar.wawancara.from} {questions.length}</span>
          </div>

          <button
            onClick={() => setShowDeviceModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            {t.pelamar.wawancara.testDevice}
          </button>
        </div>
      </div>

      {/* Main Grid: Left WebCam + Friendly Status, Right Side Question Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left webcam & controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-5">

          {/* Central Rectangular Video Feed Container */}
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden aspect-video border-2 border-slate-800 shadow-xl flex items-center justify-center group">

            {/* Live Camera Stream Preview */}
            {isCameraOn ? (
              <div className="relative w-full h-full bg-gradient-to-t from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="relative flex flex-col items-center justify-center space-y-4">
                  {selectedVideo ? (
                    <div className="flex flex-col items-center space-y-3 z-10 bg-slate-900/80 p-4 rounded-xl backdrop-blur-sm border border-emerald-500/30">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-300 text-center">
                        File Siap Diupload:<br />{selectedVideo.name}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700/80 flex items-center justify-center shadow-lg relative">
                        <UserCheck className="w-16 h-16 text-slate-400" />
                        <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-300 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700">
                        {t.pelamar.wawancara.cameraReady} (Budi Pratama)
                      </span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                <VideoOff className="w-14 h-14" />
                <span className="text-sm font-medium">{t.pelamar.wawancara.cameraOff}</span>
              </div>
            )}

            {/* Live Recording Status Indicator */}
            <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
              {isRecording ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/90 text-white text-xs sm:text-sm font-bold backdrop-blur-md animate-pulse shadow-md">
                  <span className="w-3 h-3 rounded-full bg-white"></span>
                  <span>{t.pelamar.wawancara.recording} {formatTime(recordingSeconds)}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 text-slate-300 text-xs sm:text-sm font-bold border border-slate-700/80 backdrop-blur-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span>{t.pelamar.wawancara.readyToRecord}</span>
                </div>
              )}
            </div>

            {/* User-Friendly Device Status Badges */}
            <div className="absolute top-5 right-5 z-20 flex flex-col gap-2 items-end">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/85 border border-slate-700/80 text-white text-xs font-semibold backdrop-blur-md shadow-sm">
                <Mic className="w-4 h-4 text-cyan-300" />
                <span>Mikrofon: <strong className="text-cyan-300">{t.pelamar.wawancara.micClear}</strong></span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/85 border border-slate-700/80 text-white text-xs font-semibold backdrop-blur-md shadow-sm">
                <Video className="w-4 h-4 text-emerald-400" />
                <span>Kamera: <strong className="text-emerald-300">{t.pelamar.wawancara.cameraCalibrated}</strong></span>
              </div>
            </div>
          </div>

          {/* Controls Bar Below Camera */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-[#C2E5EF] dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCameraOn(!isCameraOn)}
                className={`p-3 rounded-2xl border transition-colors cursor-pointer ${isCameraOn
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400'
                  }`}
                title={isCameraOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-2xl border transition-colors cursor-pointer ${isMicOn
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400'
                  }`}
                title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowDeviceModal(true)}
                className="p-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Pengaturan Perangkat"
              >
                <Settings2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Opsi 1: Fitur Rekam Langsung (Mendatang) */}
              <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-3">
                {!isRecording ? (
                  <button
                    onClick={() => setIsRecording(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    {t.pelamar.wawancara.startRecording}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsRecording(false)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    {t.pelamar.wawancara.stopRecording}
                  </button>
                )}

                <button
                  onClick={handleFinishAssessment}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Kirim Rekaman
                </button>
              </div>

              {/* Opsi 2: Fitur Upload Alternatif */}
              <div className="flex items-center gap-2 pl-1">
                <input
                  type="file"
                  accept="video/mp4"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => setSelectedVideo(e.target.files?.[0] || null)}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  Pilih Video (.mp4)
                </button>

                {selectedVideo && (
                  <button
                    onClick={handleUploadSubmit}
                    disabled={isUploading}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <Sparkles className="w-4 h-4 animate-spin text-[#E0F1F7]" />
                    ) : (
                      <Send className="w-4 h-4 text-[#E0F1F7]" />
                    )}
                    {isUploading ? "Mengunggah..." : "Submit Upload"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Panel: Soft Pastel Teal background showing interview question (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-[#E0F1F7] dark:bg-slate-900 border border-[#B8E1ED] dark:border-slate-800 rounded-3xl p-7 sm:p-9 space-y-6 flex-1 flex flex-col justify-between shadow-xs">

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#B8E1ED] dark:border-slate-800 pb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#1b7b9e] dark:text-cyan-400 bg-white/80 dark:bg-slate-800 px-3.5 py-1.5 rounded-lg border border-[#B8E1ED] dark:border-slate-700">
                  {questions[currentQuestionIndex].category}
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#1b7b9e] dark:text-cyan-400">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#1b7b9e] dark:text-cyan-400 uppercase tracking-wide">
                  {t.pelamar.wawancara.currentQuestion}
                </h3>
                <p className="text-base sm:text-xl font-bold text-[#1b7b9e] dark:text-white leading-relaxed">
                  "{questions[currentQuestionIndex].question}"
                </p>
              </div>

              {/* Friendly Interview Tip Card */}
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-800 border border-[#B8E1ED] dark:border-slate-700 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-bold text-[#1b7b9e] dark:text-cyan-400">
                  <HelpCircle className="w-5 h-5 text-[#1b7b9e] dark:text-cyan-400" />
                  <span>{t.pelamar.wawancara.interviewTip}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                  {questions[currentQuestionIndex].tip}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#B8E1ED] dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#1b7b9e] dark:text-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed hover:underline cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> {t.pelamar.wawancara.prevQuestion}
                </button>

                <button
                  disabled={currentQuestionIndex === questions.length - 1}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#1b7b9e] dark:text-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed hover:underline cursor-pointer"
                >
                  {t.pelamar.wawancara.nextQuestion} <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-center gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${idx === currentQuestionIndex ? 'w-8 bg-[#1b7b9e] dark:bg-cyan-400' : 'w-2.5 bg-[#1b7b9e]/30 dark:bg-cyan-400/30'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Device Testing */}
      {showDeviceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-7 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-[#1b7b9e] dark:text-cyan-400 text-lg">{t.pelamar.wawancara.deviceCheckTitle}</h3>
              <button
                onClick={() => setShowDeviceModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 space-y-1">
                <div className="flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2"><Video className="w-5 h-5 text-[#1b7b9e] dark:text-cyan-400" /> {t.pelamar.wawancara.webcamFeed}</span>
                  <span className="text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {t.pelamar.wawancara.readyToUse}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Integrated HD Camera (1080p 30fps)</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 space-y-1">
                <div className="flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2"><Mic className="w-5 h-5 text-[#1b7b9e] dark:text-cyan-400" /> {t.pelamar.wawancara.micInput}</span>
                  <span className="text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> {t.pelamar.wawancara.clearVoice}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Default Audio Input Device (Sensitivitas Aktif)</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F0F8FB] dark:bg-slate-800 border border-[#C2E5EF] dark:border-slate-700 space-y-1">
                <div className="flex justify-between items-center font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2"><Volume2 className="w-5 h-5 text-[#1b7b9e] dark:text-cyan-400" /> {t.pelamar.wawancara.internetConnection}</span>
                  <span className="text-emerald-600 font-bold">{t.pelamar.wawancara.stable}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDeviceModal(false)}
              className="w-full py-3 rounded-full bg-[#1b7b9e] hover:bg-[#1D7FA1] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              {t.pelamar.wawancara.closeAndStart}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
