'use client';

import React, { useState, useEffect } from 'react';
import { Mail, AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';

export interface OtpVerificationCardProps {
  email: string;
  title?: string;
  subtitle?: string;
  alertNotice?: React.ReactNode;
  onVerify: (otp: string) => Promise<void> | void;
  onResend: () => Promise<void> | void;
  onBack?: () => void;
  backButtonText?: string;
  isLoading?: boolean;
  error?: string;
  buttonText?: string;
  inputPrefix?: string;
  initialCountdown?: number;
}

export default function OtpVerificationCard({
  email,
  title = 'Verifikasi Email',
  subtitle = 'Masukkan 6-digit kode OTP yang dikirim ke',
  alertNotice,
  onVerify,
  onResend,
  onBack,
  backButtonText = '(Ubah)',
  isLoading = false,
  error = '',
  buttonText = 'Verifikasi Email',
  inputPrefix = 'otp-input',
  initialCountdown = 0,
}: OtpVerificationCardProps) {
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(initialCountdown);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue && value !== '') return;

    const newOtp = [...otpCode];
    newOtp[index] = cleanValue.slice(-1);
    setOtpCode(newOtp);

    // Auto focus next input
    if (cleanValue && index < 5) {
      const nextInput = document.getElementById(`${inputPrefix}-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otpCode];

      if (otpCode[index]) {
        // Jika kotak saat ini ada isinya, hapus isinya dan langsung pindahkan fokus ke kotak sebelumnya
        newOtp[index] = '';
        setOtpCode(newOtp);
        if (index > 0) {
          const prevInput = document.getElementById(`${inputPrefix}-${index - 1}`);
          if (prevInput) prevInput.focus();
        }
      } else if (index > 0) {
        // Jika kotak saat ini sudah kosong, hapus kotak sebelumnya dan mundurkan fokus
        newOtp[index - 1] = '';
        setOtpCode(newOtp);
        const prevInput = document.getElementById(`${inputPrefix}-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      const newOtp = [...otpCode];
      newOtp[index] = '';
      setOtpCode(newOtp);
      return;
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const prevInput = document.getElementById(`${inputPrefix}-${index - 1}`);
      if (prevInput) prevInput.focus();
      return;
    }

    if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      const nextInput = document.getElementById(`${inputPrefix}-${index + 1}`);
      if (nextInput) nextInput.focus();
      return;
    }
  };

  const handleClearAll = () => {
    setOtpCode(['', '', '', '', '', '']);
    const firstInput = document.getElementById(`${inputPrefix}-0`);
    if (firstInput) firstInput.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = ['', '', '', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtpCode(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      const targetInput = document.getElementById(`${inputPrefix}-${focusIndex}`);
      if (targetInput) targetInput.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpCode.join('');
    if (fullOtp.length < 6) return;
    await onVerify(fullOtp);
  };

  const handleTriggerResend = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    try {
      await onResend();
      setResendTimer(60);
    } finally {
      setIsResending(false);
    }
  };

  const hasAnyDigit = otpCode.some((d) => d !== '');

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-200 mx-auto text-center">
      
      {/* Mail Icon Badge */}
      <div className="mx-auto w-14 h-14 bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900/80 rounded-2xl flex items-center justify-center text-[#1A4B9F] dark:text-blue-400 shadow-sm">
        <Mail size={26} />
      </div>

      {/* Header & Email */}
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
          {subtitle}{' '}
          <span className="font-semibold text-slate-900 dark:text-white break-all">{email}</span>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-[#1A4B9F] dark:text-blue-400 hover:underline font-semibold text-xs ml-1 cursor-pointer"
            >
              {backButtonText}
            </button>
          )}
        </p>
      </div>

      {/* Alert Notice Banner */}
      {alertNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs font-medium text-left flex items-start gap-2.5 leading-relaxed shadow-xs">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="flex-1">{alertNotice}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 3 x 3 Split OTP Inputs with Auto-Focus, Rapid-Backspace, and Click Selection */}
        <div className="space-y-2">
          <div className="flex justify-center items-center gap-2">
            <div className="flex gap-1.5 sm:gap-2">
              {otpCode.slice(0, 3).map((digit, idx) => (
                <input
                  key={idx}
                  id={`${inputPrefix}-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={handleOtpPaste}
                  onFocus={(e) => e.target.select()}
                  className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-all shadow-sm"
                  autoFocus={idx === 0}
                />
              ))}
            </div>
            <span className="text-slate-300 dark:text-slate-700 font-light text-xl select-none px-0.5">—</span>
            <div className="flex gap-1.5 sm:gap-2">
              {otpCode.slice(3, 6).map((digit, idx) => {
                const realIdx = idx + 3;
                return (
                  <input
                    key={realIdx}
                    id={`${inputPrefix}-${realIdx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(realIdx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(realIdx, e)}
                    onPaste={handleOtpPaste}
                    onFocus={(e) => e.target.select()}
                    className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 focus:border-[#1A4B9F] dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-all shadow-sm"
                  />
                );
              })}
            </div>
          </div>

          {/* Quick Clear All Button */}
          {hasAnyDigit && (
            <div className="flex justify-center pt-1 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-medium text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer py-0.5 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RotateCcw size={12} />
                <span>Hapus semua digit</span>
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isLoading || otpCode.join('').length < 6}
          className="w-full py-3.5 rounded-xl bg-[#1A4B9F] hover:bg-[#133878] active:bg-[#0f2a5a] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? 'Memverifikasi...' : buttonText}
        </button>

        {/* Footer Resend */}
        <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-left">
            <span>Belum menerima kode? </span>
            <button
              type="button"
              onClick={handleTriggerResend}
              disabled={resendTimer > 0 || isResending}
              className="text-[#1A4B9F] dark:text-blue-400 font-bold hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed cursor-pointer ml-0.5"
            >
              {isResending
                ? 'Mengirim...'
                : resendTimer > 0
                ? `Kirim ulang (${resendTimer}s)`
                : 'Kirim Ulang Kode'}
            </button>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline flex items-center gap-1 cursor-pointer text-xs"
            >
              <ArrowLeft size={13} />
              <span>Kembali</span>
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
