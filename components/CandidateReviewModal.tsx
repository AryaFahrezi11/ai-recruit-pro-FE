'use client';

import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle2, Send, Sparkles, User, Briefcase, MessageSquareQuote } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, parseErrorMessage } from '@/lib/api';

export interface UserReview {
  id: string;
  name: string;
  role: string;
  rating: number; // 1 to 5
  category?: string;
  comment: string;
  created_at: string;
}

interface CandidateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (newReview: UserReview) => void;
  defaultName?: string;
  defaultRole?: string;
  contextEvent: string;
}

export function CandidateReviewModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  defaultName = '',
  defaultRole = '',
  contextEvent
}: CandidateReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState<string>(defaultName);
  const [role, setRole] = useState<string>(defaultRole);
  const [category, setCategory] = useState<string>('Wawancara Video Virtual');
  const [comment, setComment] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-fill from candidate profile in localStorage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCv = localStorage.getItem('candidateCvData');
      if (storedCv) {
        try {
          const parsed = JSON.parse(storedCv);
          if (parsed.fullName && !name) setName(parsed.fullName);
          if (parsed.jobTitle && !role) setRole(parsed.jobTitle);
        } catch (e) {
          // ignore
        }
      }
      const userEmail = localStorage.getItem('user_email');
      if (!name && userEmail) {
        const nameFromEmail = userEmail.split('@')[0].replace(/[._-]/g, ' ');
        setName(nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = [
    'Kejelasan Status',
    'Wawancara Video',
    'Rekomendasi Lowongan',
    'Pengalaman Melamar'
  ];

  const ratingLabels: Record<number, string> = {
    1: 'Kurang Memuaskan (1/5)',
    2: 'Cukup (2/5)',
    3: 'Bagus (3/5)',
    4: 'Sangat Bagus (4/5)',
    5: 'Luar Biasa & Sangat Memuaskan (5/5)'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error('Harap tuliskan ulasan atau pengalaman Anda terlebih dahulu.');
      return;
    }

    if (!name.trim()) {
      toast.error('Harap isi nama Anda.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        rating,
        category,
        role: role.trim() || 'Pelamar Kerja',
        comment: comment.trim(),
        context_event: contextEvent,
        is_anonymous: isAnonymous
      };

      const res = await api.post('/reviews/', payload);

      toast.success('Terima kasih! Ulasan Anda berhasil dikirim dan akan tampil di Landing Page (jika memenuhi syarat).');

      if (onSubmitSuccess) {
        onSubmitSuccess(res);
      }

      onClose();
    } catch (err: any) {
      if (err.status === 400 && err.message?.includes('sudah memberikan ulasan')) {
        toast.error('Anda sudah memberikan ulasan untuk tahap ini.');
      } else {
        toast.error('Gagal menyimpan ulasan. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 relative overflow-hidden">
        
        {/* Top Decorative Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1A4B9F] via-blue-500 to-indigo-600" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Modal Title & Subtitle */}
        <div className="space-y-1.5 text-center pt-1">
          <div className="w-10 h-10 rounded-xl bg-[#1A4B9F]/10 dark:bg-slate-800 border border-[#1A4B9F]/20 dark:border-slate-700 flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 mx-auto shrink-0">
            <MessageSquareQuote size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Bagikan Pengalaman Anda
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Terima kasih telah melamar lowongan di AI-RecruitPro. Berikan ulasan atau kesan mengenai pengalaman Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Star Rating Selector */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Berapa Rating Pengalaman Anda?
            </label>
            <div className="flex justify-center items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const activeStar = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                  >
                    <Star
                      size={28}
                      className={
                        activeStar
                          ? 'text-amber-400 fill-amber-400 drop-shadow-xs transition-colors'
                          : 'text-slate-300 dark:text-slate-700 transition-colors'
                      }
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-semibold text-[#1A4B9F] dark:text-blue-400">
              {ratingLabels[hoverRating || rating]}
            </p>
          </div>

          {/* Category Selector Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Kategori Ulasan Utama
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#1A4B9F] text-white border-[#1A4B9F] shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="review-comment" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ulasan / Kesan Anda <span className="text-red-500">*</span>
            </label>
            <textarea
              id="review-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tuliskan ulasan atau pengalaman Anda menggunakan platform AI-RecruitPro..."
              className="w-full px-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 rounded-2xl text-xs sm:text-sm outline-none transition-all resize-none"
            />
          </div>

          {/* Name & Role Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="reviewer-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Anda <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <User size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  id="reviewer-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-[#1A4B9F] rounded-xl text-xs outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="reviewer-role" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Posisi / Bidang
              </label>
              <div className="relative flex items-center">
                <Briefcase size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  id="reviewer-role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="misal: Software Engineer"
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:border-[#1A4B9F] rounded-xl text-xs outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Anonymous Checkbox */}
          <div className="flex items-center gap-2">
            <input
              id="reviewer-anonymous"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#1A4B9F] focus:ring-[#1A4B9F]"
            />
            <label htmlFor="reviewer-anonymous" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
              Sembunyikan nama saya saat ditampilkan (Anonim)
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Send size={15} />
            <span>{isSubmitting ? 'Mengirim Ulasan...' : 'Kirim Ulasan Pengalaman'}</span>
          </button>

        </form>

      </div>
    </div>
  );
}
