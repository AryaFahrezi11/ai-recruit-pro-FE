'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export function DecisionHub() {
  const { t } = useTranslation();

  return (
    <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm transition-colors duration-300">
      <h3 className="text-lg font-bold mb-6">{t.reviews?.decisionHub}</h3>

      {/* Consensus Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
            {t.reviews?.overallConsensus}
          </span>
          <span className="text-2xl font-bold text-primary leading-none">65%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
        </div>
      </div>

      {/* Vote Breakdown */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold mb-4">{t.reviews?.voteBreakdown}</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-muted-foreground">{t.reviews?.strongYes}</span>
            </div>
            <span className="font-semibold">3</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-muted-foreground">{t.reviews?.yes}</span>
            </div>
            <span className="font-semibold">5</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-muted-foreground">{t.reviews?.neutral}</span>
            </div>
            <span className="font-semibold">2</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <span className="text-muted-foreground">{t.reviews?.no}</span>
            </div>
            <span className="font-semibold">0</span>
          </div>
        </div>
      </div>

      <button className="w-full py-2.5 px-4 bg-card hover:bg-muted border border-border rounded-lg text-sm font-semibold transition-colors">
        {t.reviews?.requestMoreFeedback}
      </button>
    </div>
  );
}
