'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ArchiveTable() {
  const { t } = useTranslation();

  const mockData = [
    {
      id: 1,
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      role: 'Senior Frontend Engineer',
      department: 'Engineering',
      dateClosed: 'Oct 24, 2023',
      outcome: 'hired',
      initials: 'JD',
      avatarBg: 'bg-[#2596be]',
    },
    {
      id: 2,
      name: 'Alex Smith',
      email: 'alex.s@example.com',
      role: 'UX Designer',
      department: 'Design',
      dateClosed: 'Oct 18, 2023',
      outcome: 'rejected',
      initials: 'AS',
      avatarBg: 'bg-indigo-200 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
    },
  ];

  return (
    <div className="bg-card text-card-foreground border border-border border-t-0 rounded-b-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-muted-foreground font-semibold text-xs uppercase tracking-wider border-b border-border">
            <tr>
              <th className="px-6 py-4">{t.archive?.candidate}</th>
              <th className="px-6 py-4">{t.archive?.role}</th>
              <th className="px-6 py-4">{t.archive?.department}</th>
              <th className="px-6 py-4">{t.archive?.dateClosed}</th>
              <th className="px-6 py-4">{t.archive?.outcome}</th>
              <th className="px-6 py-4 text-right">{t.archive?.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockData.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${row.avatarBg} ${row.avatarBg.includes('teal') ? 'text-white' : ''}`}>
                      {row.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{row.role}</td>
                <td className="px-6 py-4 text-muted-foreground">{row.department}</td>
                <td className="px-6 py-4 text-muted-foreground">{row.dateClosed}</td>
                <td className="px-6 py-4">
                  {row.outcome === 'hired' ? (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full border border-transparent">
                      {t.archive?.hired}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-full border border-transparent">
                      {t.archive?.rejected}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {/* Actions placeholder if needed */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-border flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t.archive?.showing} <strong>1</strong> {t.archive?.to} <strong>10</strong> {t.archive?.of} <strong>97</strong> {t.archive?.results}
        </p>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-primary bg-primary text-primary-foreground font-medium transition-colors">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-border text-foreground hover:bg-muted transition-colors">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-border text-foreground hover:bg-muted transition-colors">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
