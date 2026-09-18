'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  className?: string;
  showSubtitle?: boolean;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export default function BrandLogo({
  className = '',
  showSubtitle = false,
  showBadge = true,
  size = 'md',
  href = '/'
}: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-[19px]',
    lg: 'text-2xl',
  };

  const Content = (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* High-tech Icon Emblem with ambient glow */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-sky-400/30 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Icon Frame */}
        <div className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-slate-900 via-[#0F2042] to-[#1A4B9F] p-1.5 flex items-center justify-center shadow-md shadow-blue-950/25 ring-1 ring-white/20 dark:ring-white/10 group-hover:scale-105 group-hover:shadow-blue-500/25 transition-all duration-300`}>
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-sm"
          >
            <defs>
              <linearGradient id="brandLeftLeg" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0B1E3F" />
                <stop offset="60%" stopColor="#1E4B9F" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
              <linearGradient id="brandRightLeg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="60%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="brandCross" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <filter id="brandGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Left Stalk */}
            <path
              d="M 24 94 L 52 24 C 54 19 59 16 65 16 L 68 16 C 73 16 77 19 79 23 L 52 94 C 50 99 44 102 39 102 L 27 102 C 22 102 19 97 24 94 Z"
              fill="url(#brandLeftLeg)"
            />

            {/* Right Sweep */}
            <path
              d="M 58 20 C 62 16 68 16 72 20 L 98 86 C 102 96 95 102 85 102 L 72 102 C 67 102 63 98 61 93 L 44 48 Z"
              fill="url(#brandRightLeg)"
            />

            {/* Bridge / Crossbar */}
            <path
              d="M 36 67 L 84 67 C 88 67 91 70 89 74 L 87 78 C 85 82 81 84 77 84 L 30 84 C 26 84 23 81 25 77 L 27 73 C 29 69 32 67 36 67 Z"
              fill="url(#brandCross)"
            />

            {/* AI Neural Sparkle Node */}
            <circle cx="88" cy="27" r="7" fill="#38BDF8" filter="url(#brandGlow)" />
            <circle cx="88" cy="27" r="3.5" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-2">
          <span className={`font-black ${textSizes[size]} tracking-tight text-slate-900 dark:text-white transition-colors`}>
            AI-Recruit<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A4B9F] via-blue-600 to-sky-500">Pro</span>
          </span>

          {showBadge && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-[#1A4B9F] dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              AI
            </span>
          )}
        </div>

        {showSubtitle && (
          <span className="text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400 mt-0.5">
            Intelligent Recruitment Platform
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return Content;

  return (
    <Link href={href} className="inline-block">
      {Content}
    </Link>
  );
}
