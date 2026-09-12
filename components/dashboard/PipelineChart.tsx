'use client';

import React from 'react';
import {
  AreaChart,
  Area,
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-lg">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{payload[0].value} <span className="font-medium text-slate-500">Pelamar</span></p>
        </div>
      </div>
    );
  }
  return null;
};

export function PipelineChart({ data }: PipelineChartProps) {
  return (
    <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col w-full h-[220px]">
      <div className="mb-4">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Tren Pertumbuhan Pelamar</h3>
      </div>
      <div className="w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800/80" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 500 }}
              className="text-slate-400 dark:text-slate-500"
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 500 }}
              className="text-slate-400 dark:text-slate-500"
              tickFormatter={(value) => value === 0 ? '0' : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2563EB', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
              activeDot={{ r: 4, fill: '#2563EB', stroke: '#fff', strokeWidth: 2, className: "shadow-sm" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
