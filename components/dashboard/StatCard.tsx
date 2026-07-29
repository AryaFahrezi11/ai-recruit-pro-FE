import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue,
  iconBgColor = 'bg-primary/10',
  iconColor = 'text-primary'
}: StatCardProps) {
  return (
    <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-sm flex flex-col transition-colors duration-300 hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">{title}</h3>
        <div className={`p-2 rounded-lg ${iconBgColor} ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div className="mt-auto">
        <div className="text-3xl font-bold mb-2">{value}</div>
        <div className="flex items-center text-sm">
          {trend === 'up' && (
            <svg className="w-4 h-4 mr-1 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
          {trend === 'down' && (
            <svg className="w-4 h-4 mr-1 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          )}
          {trend === 'neutral' && (
            <svg className="w-4 h-4 mr-1 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className={trend ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}>
            {trendValue}
          </span>
          {trendValue && <span className="mx-1 text-muted-foreground">•</span>}
          <span className="text-muted-foreground">{subtitle}</span>
        </div>
      </div>
    </div>
  );
}
