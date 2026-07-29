'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronRight } from 'lucide-react';

export function PendingReviewsQueue() {
  const { t } = useTranslation();

  return (
    <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm transition-colors duration-300">
      <h3 className="text-lg font-bold mb-4">{t.reviews?.pendingYourReview}</h3>
      
      <div className="space-y-3">
        {/* Item 1 */}
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-sidebar/50 cursor-pointer transition-colors border border-transparent hover:border-border group">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">
              MC
            </div>
            <div>
              <h4 className="text-sm font-semibold">Michael Chen</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{t.reviews?.dueTomorrow}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>

        {/* Item 2 */}
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-sidebar/50 cursor-pointer transition-colors border border-transparent hover:border-border group">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold shrink-0">
              SK
            </div>
            <div>
              <h4 className="text-sm font-semibold">Sarah Kim</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{t.reviews?.dueIn} 3 {t.reviews?.days}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </div>
  );
}
