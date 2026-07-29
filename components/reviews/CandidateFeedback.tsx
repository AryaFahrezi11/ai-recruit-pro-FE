'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { BrainCircuit, MessageSquare, ThumbsUp, Send } from 'lucide-react';

export function CandidateFeedback() {
  const { t } = useTranslation();

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden transition-colors duration-300">
      
      {/* Header */}
      <div className="p-6 border-b border-border flex items-start justify-between">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-border">
            <img src="https://i.pravatar.cc/150?img=44" alt="Elena Rodriguez" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Elena Rodriguez</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t.reviews?.applied}: Oct 24, 2023 &bull; Technical Interview
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full border border-blue-200 dark:border-blue-800">
          {t.reviews?.pendingReview}
        </span>
      </div>

      <div className="p-6 space-y-6">
        
        {/* AI Insight Summary */}
        <div className="bg-sidebar/50 rounded-lg p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <BrainCircuit size={18} className="text-indigo-500" />
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
              {t.reviews?.aiInsightSummary}
            </h3>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            Strong alignment with core technical requirements (React, TypeScript). 
            Demonstrated excellent problem-solving in the technical assessment. 
            Potential area for probe: experience with large-scale micro-frontends is limited.
          </p>
        </div>

        {/* Team Feedback List */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={18} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              {t.reviews?.teamFeedback} (2/4)
            </h3>
          </div>
          
          <div className="space-y-4">
            {/* Feedback 1 */}
            <div className="bg-sidebar/30 p-4 rounded-lg border border-border/50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                    JS
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">James Smith <span className="text-muted-foreground font-normal">- Tech Lead</span></h4>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  <ThumbsUp size={14} />
                  {t.reviews?.strongYes}
                </div>
              </div>
              <p className="text-sm text-muted-foreground pl-11">
                Great technical depth. Handled the system design question perfectly. Good culture fit.
              </p>
            </div>

            {/* Feedback 2 */}
            <div className="bg-sidebar/30 p-4 rounded-lg border border-border/50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                    AL
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Anna Lee <span className="text-muted-foreground font-normal">- Product Manager</span></h4>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500 text-sm font-medium">
                  <div className="w-3 h-0.5 bg-amber-500 rounded-full" />
                  {t.reviews?.neutral}
                </div>
              </div>
              <p className="text-sm text-muted-foreground pl-11">
                Communication was okay, but seemed hesitant when discussing cross-functional collaboration. Needs further vetting on this front.
              </p>
            </div>
          </div>
        </div>

        {/* Add Feedback Input */}
        <div className="flex gap-3 items-start pt-2">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-border mt-1">
            <img src="https://i.pravatar.cc/150?img=47" alt="Me" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 relative">
            <textarea 
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-20"
              placeholder={t.reviews?.addFeedback}
            />
            <button className="absolute right-2 bottom-2 bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-md transition-colors">
              <Send size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
