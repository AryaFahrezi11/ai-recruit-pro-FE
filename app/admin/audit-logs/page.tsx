'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, FileText, User, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAuth('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      toast.error('Gagal memuat catatan sistem');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('ERROR') || action.includes('FAIL')) return <AlertTriangle className="text-black dark:text-white" size={16} />;
    if (action.includes('VERIFY') || action.includes('SUCCESS')) return <CheckCircle className="text-black dark:text-white" size={16} />;
    return <Info className="text-black dark:text-white" size={16} />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('ERROR') || action.includes('FAIL')) return 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    if (action.includes('VERIFY') || action.includes('SUCCESS')) return 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700';
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  return (
    <div className="space-y-6 font-sans antialiased">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="text-black dark:text-white" size={24} /> Catatan Sistem (Audit Logs)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">Pantau seluruh aktivitas penting dan error sistem secara real-time.</p>
        </div>
        <button 
          onClick={loadLogs}
          className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors shadow-xs cursor-pointer"
        >
          Refresh Data
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Aksi</th>
                <th className="px-6 py-4">Aktor / Pengguna</th>
                <th className="px-6 py-4">Detail Informasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Memuat catatan sistem...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                    <div className="flex justify-center mb-2">
                      <FileText size={32} className="text-black dark:text-white" />
                    </div>
                    Belum ada catatan sistem
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                        <Clock size={14} className="text-black dark:text-white" />
                        {formatDate(log.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                          {log.action.includes('AI') ? (
                            <ShieldAlert size={14} className="text-black dark:text-white" />
                          ) : (
                            <User size={14} className="text-black dark:text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{log.user_name || 'Sistem / Bot'}</p>
                          {log.user_id && <p className="text-[10px] text-slate-400 font-mono">{log.user_id}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                        <pre className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap break-all">
                          {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details || '-'}
                        </pre>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
