'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  name: string;
  value: number;
}

interface PipelineChartProps {
  data: ChartDataPoint[];
}

export function PipelineChart({ data }: PipelineChartProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm flex flex-col transition-colors duration-300 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">{t.dashboard.pipelineGrowth}</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-primary/10 text-primary font-medium rounded-md">
            {t.dashboard.weekly}
          </button>
          <button className="px-3 py-1 text-sm text-muted-foreground hover:bg-muted font-medium rounded-md transition-colors">
            {t.dashboard.monthly}
          </button>
        </div>
      </div>

      <div className="w-full h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1b7b9e" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#1b7b9e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-card-foreground)'
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1b7b9e"
              strokeWidth={4}
              dot={{ r: 6, fill: 'var(--color-card)', stroke: '#1b7b9e', strokeWidth: 3 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
