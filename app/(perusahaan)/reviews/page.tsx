'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { CandidateFeedback } from '@/components/reviews/CandidateFeedback';
import { DecisionHub } from '@/components/reviews/DecisionHub';
import { PendingReviewsQueue } from '@/components/reviews/PendingReviewsQueue';
import { Search, Filter } from 'lucide-react';

export default function ReviewsPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t.reviews?.title}</h1>
          <p className="text-muted-foreground">{t.reviews?.subtitle} Senior Frontend Developer {t.reviews?.role}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder={t.pipeline?.search}
              className="w-full pl-9 pr-4 py-2 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm transition-all outline-none shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm shrink-0">
            <Filter size={16} className="text-muted-foreground" />
            {t.pipeline?.filter}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Candidate Feedback */}
        <div className="lg:col-span-2">
          <CandidateFeedback />
        </div>
        
        {/* Right Column: Widgets */}
        <div className="space-y-6">
          <DecisionHub />
          <PendingReviewsQueue />
        </div>

      </div>
    </div>
  );
}
