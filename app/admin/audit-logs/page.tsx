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
    if (action.includes('ERROR') || action.includes('FAIL')) return <AlertTriangle className="text-rose-500" size={18} />;
    if (action.includes('VERIFY') || action.includes('SUCCESS')) return <CheckCircle className="text-emerald-500" size={18} />;
    return <Info className="text-blue-500" size={18} />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('ERROR') || action.includes('FAIL')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('VERIFY') || action.includes('SUCCESS')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-slate-600" /> Catatan Sistem (Audit Logs)
          </h1>
          <p className="text-slate-500 text-sm mt-1">Pantau seluruh aktivitas penting dan error sistem secara real-time.</p>
        </div>
        <button 
          onClick={loadLogs}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 text-slate-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 rounded-tl-3xl">Waktu</th>
                <th className="px-6 py-4">Aksi</th>
                <th className="px-6 py-4">Aktor / Pengguna</th>
                <th className="px-6 py-4 rounded-tr-3xl">Detail Informasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                    Memuat catatan sistem...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex justify-center mb-2">
                      <FileText size={32} className="text-slate-300" />
                    </div>
                    Belum ada catatan sistem
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock size={14} className="text-slate-400" />
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
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          {log.action.includes('AI') ? (
                            <ShieldAlert size={14} className="text-slate-500" />
                          ) : (
                            <User size={14} className="text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{log.user_name || 'Sistem / Bot'}</p>
                          {log.user_id && <p className="text-[10px] text-slate-400 font-mono">{log.user_id}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap break-all">
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
