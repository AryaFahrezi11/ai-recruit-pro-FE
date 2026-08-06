'use client';

import React, { useEffect, useState } from 'react';
import { Users, Building2, GraduationCap, ShieldCheck, TrendingUp, AlertCircle } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pelamar: 0,
    perusahaan: 0,
    kampus: 0,
    pendingVerifications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersResponse = await fetchAuth('/api/admin/users', { method: 'GET' });
        const pendingResponse = await fetchAuth('/api/admin/perusahaan/pending', { method: 'GET' });
        
        const users = await usersResponse.json();
        const pending = await pendingResponse.json();

        setStats({
          totalUsers: users.length,
          pelamar: users.filter((u: any) => u.role === 'pelamar').length,
          perusahaan: users.filter((u: any) => u.role === 'perusahaan').length,
          kampus: users.filter((u: any) => u.role === 'kampus').length,
          pendingVerifications: pending.length,
        });
      } catch (error) {
        toast.error('Gagal mengambil statistik dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Pengguna', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Pelamar', value: stats.pelamar, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Perusahaan Terdaftar', value: stats.perusahaan, icon: Building2, color: 'text-violet-600', bg: 'bg-violet-100' },
    { label: 'Kampus Mitra', value: stats.kampus, icon: GraduationCap, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Overview Sistem</h1>
        <p className="text-slate-500 text-sm mt-1">Pantau performa dan statistik pengguna AI-Recruit Pro</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse h-32"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Action Alerts */}
      {!isLoading && stats.pendingVerifications > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h4 className="font-bold text-amber-800">Butuh Perhatian Admin</h4>
            <p className="text-amber-700 text-sm mt-1">
              Ada <strong>{stats.pendingVerifications} perusahaan</strong> baru yang mendaftar dan menunggu proses verifikasi legalitas (NIB/NPWP).
            </p>
            <a href="/admin/verifikasi" className="inline-block mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
              Tinjau Sekarang
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
