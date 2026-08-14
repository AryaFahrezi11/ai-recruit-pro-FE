'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Building2, GraduationCap, AlertCircle, Calendar, ArrowRight, UserPlus, Clock, Server, Activity, Cpu, Database, Briefcase, Archive, FileText } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pelamar: 0,
    perusahaan: 0,
    kampus: 0,
    pendingVerifications: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [jobsData, setJobsData] = useState<any[]>([]);
  const [roleData, setRoleData] = useState<any[]>([]);
  
  const [aiStats, setAiStats] = useState({
    uptime: '-',
    latency: '-',
    tokenUsage: '-',
    parsedCVs: '-',
    status: 'Loading...'
  });

  const [jobMetrics, setJobMetrics] = useState({
    activeJobs: 0,
    closedJobs: 0,
    totalApplications: 0,
    trend7Days: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersResponse = await fetchAuth('/api/admin/users', { method: 'GET' });
        const pendingResponse = await fetchAuth('/api/admin/perusahaan/pending', { method: 'GET' });
        
        const users = await usersResponse.json();
        const pending = await pendingResponse.json();

        try {
          const statsResponse = await fetchAuth('/api/admin/system-stats', { method: 'GET' });
          if (statsResponse.ok) {
            const sysStats = await statsResponse.json();
            setAiStats(sysStats);
          } else {
            setAiStats(prev => ({ ...prev, status: 'Offline' }));
          }
        } catch (e) {
          setAiStats(prev => ({ ...prev, status: 'Offline' }));
        }

        try {
          const jobResponse = await fetchAuth('/api/admin/job-metrics', { method: 'GET' });
          if (jobResponse.ok) {
            const jm = await jobResponse.json();
            setJobMetrics(jm);
          }
        } catch (e) {
          // Silent catch for job metrics
        }

        setStats({
          totalUsers: users.length,
          pelamar: users.filter((u: any) => u.role === 'pelamar').length,
          perusahaan: users.filter((u: any) => u.role === 'perusahaan').length,
          kampus: users.filter((u: any) => u.role === 'kampus').length,
          pendingVerifications: pending.length,
        });

        try {
          const [resReg, resJobs] = await Promise.all([
            fetchAuth('/api/admin/analytics/registrations'),
            fetchAuth('/api/admin/analytics/jobs')
          ]);
          if (resReg.ok && resJobs.ok) {
            const dataReg = await resReg.json();
            const dataJobs = await resJobs.json();
            const formatMonth = (m: string) => {
              const date = new Date(m + '-01');
              return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
            };
            setRegistrations(dataReg.map((d: any) => ({ ...d, month: formatMonth(d.month) })));
            setJobsData(dataJobs.monthly.map((d: any) => ({ ...d, month: formatMonth(d.month) })));
          }
        } catch(e) {}

        // Get role distribution data
        const roles = { pelamar: 0, perusahaan: 0, kampus: 0, admin: 0 };
        users.forEach((u: any) => {
          if (roles[u.role as keyof typeof roles] !== undefined) {
            roles[u.role as keyof typeof roles] += 1;
          }
        });
        
        setRoleData([
          { name: 'Pelamar', value: roles.pelamar, color: '#10b981' }, 
          { name: 'Perusahaan', value: roles.perusahaan, color: '#8b5cf6' },
          { name: 'Kampus', value: roles.kampus, color: '#f97316' },
          { name: 'Admin', value: roles.admin, color: '#3b82f6' },
        ].filter(d => d.value > 0));

        // Get recent users
        const sortedUsers = [...users].sort((a, b) => {
          if (!a.created_at) return 1;
          if (!b.created_at) return -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setRecentUsers(sortedUsers.slice(0, 5));

        // Get chart data (last 6 months)
        const last6Months = Array.from({length: 6}, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return {
                month: d.toLocaleString('id-ID', { month: 'short' }),
                year: d.getFullYear(),
                count: 0
            };
        }).reverse();

        users.forEach((u: any) => {
            if(!u.created_at) return;
            const date = new Date(u.created_at);
            const monthStr = date.toLocaleString('id-ID', { month: 'short' });
            const year = date.getFullYear();
            const target = last6Months.find(m => m.month === monthStr && m.year === year);
            if(target) target.count += 1;
        });

        setChartData(last6Months.map(d => ({
            name: `${d.month}`,
            Pendaftar: d.count
        })));

      } catch (error) {
        toast.error('Gagal mengambil statistik dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Pengguna', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Total Pelamar', value: stats.pelamar, icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Perusahaan Terdaftar', value: stats.perusahaan, icon: Building2, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
    { label: 'Kampus Mitra', value: stats.kampus, icon: GraduationCap, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">Overview Sistem</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau performa, analitik, dan statistik terbaru platform AI-Recruit Pro</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Pending Action Alerts */}
      {!isLoading && stats.pendingVerifications > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <AlertCircle size={24} className="text-white" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Butuh Perhatian Admin</h4>
              <p className="text-amber-50 text-sm mt-1 max-w-xl">
                Ada <strong>{stats.pendingVerifications} perusahaan</strong> baru yang mendaftar dan menunggu proses verifikasi legalitas (NIB/NPWP).
              </p>
            </div>
          </div>
          <Link href="/admin/verifikasi" className="relative z-10 whitespace-nowrap px-6 py-3 bg-white text-amber-600 hover:bg-amber-50 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 group">
            Tinjau Sekarang
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 animate-pulse h-36"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity ${stat.bg}`}></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                  <h3 className="text-4xl font-black text-slate-800 mt-2">{stat.value.toLocaleString('id-ID')}</h3>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} ${stat.border} border`}>
                  <stat.icon size={28} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* METRIK LOWONGAN PEKERJAAN (Baru ditambahkan) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Metrics Cards */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Metrik Lowongan</h2>
            <p className="text-sm text-slate-500">Ringkasan aktivitas lamaran</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50/50 hover:bg-blue-50 rounded-2xl border border-blue-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 text-white rounded-xl shadow-sm shadow-blue-500/20"><Briefcase size={20} /></div>
                <div className="text-sm font-semibold text-slate-700">Lowongan Aktif</div>
              </div>
              <div className="text-xl font-bold text-blue-700">{isLoading ? '-' : jobMetrics.activeJobs}</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-400 text-white rounded-xl"><Archive size={20} /></div>
                <div className="text-sm font-semibold text-slate-700">Lowongan Ditutup</div>
              </div>
              <div className="text-xl font-bold text-slate-700">{isLoading ? '-' : jobMetrics.closedJobs}</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl border border-emerald-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm shadow-emerald-500/20"><FileText size={20} /></div>
                <div className="text-sm font-semibold text-slate-700">Total Lamaran</div>
              </div>
              <div className="text-xl font-bold text-emerald-700">{isLoading ? '-' : jobMetrics.totalApplications}</div>
            </div>
          </div>
        </div>

        {/* 7 Day Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Tren Lamaran (7 Hari)</h2>
              <p className="text-sm text-slate-500">Jumlah pelamar harian seminggu terakhir</p>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            {isLoading ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl"></div>
            ) : jobMetrics.trend7Days.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <Activity size={32} className="mb-2 text-slate-200" />
                Belum ada data lamaran minggu ini
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobMetrics.trend7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="lamaran" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ANALYTICS CHARTS DARI LAPORAN & ANALITIK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Pertumbuhan Pendaftar Baru</h2>
              <p className="text-sm text-slate-500">Statistik pendaftaran 6 bulan terakhir</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl"></div>
            ) : registrations.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm">Belum ada data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={registrations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="kandidat" name="Kandidat" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="perusahaan" name="Perusahaan" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Jobs Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Tren Lowongan Pekerjaan</h2>
              <p className="text-sm text-slate-500">Pertumbuhan lowongan aktif dan ditutup</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl"></div>
            ) : jobsData.length === 0 ? (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm">Belum ada data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={jobsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="total" name="Total Lowongan" stroke="#94a3b8" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="active" name="Lowongan Aktif" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="closed" name="Berhasil Diisi" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* CHARTS USER & RECENT USERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Roles Pie Chart */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Distribusi Pengguna</h2>
            <p className="text-sm text-slate-500">Persentase pengguna berdasarkan peran</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {isLoading ? (
               <div className="w-48 h-48 rounded-full border-8 border-slate-100 animate-pulse"></div>
            ) : roleData.length === 0 ? (
               <p className="text-slate-400 text-sm">Belum ada data</p>
            ) : (
              <>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {roleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4 w-full">
                  {roleData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      {entry.name} ({entry.value})
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Pendaftar Terbaru</h2>
              <p className="text-sm text-slate-500">Pengguna yang baru bergabung</p>
            </div>
            <Link href="/admin/users" className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors">
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: '300px' }}>
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/3 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-10">
                <Users size={40} className="mb-3 text-slate-300" />
                <p className="text-sm">Belum ada pengguna terbaru</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user, idx) => (
                  <div key={user.id || idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        user.role === 'pelamar' ? 'bg-emerald-100 text-emerald-600' :
                        user.role === 'perusahaan' ? 'bg-violet-100 text-violet-600' :
                        user.role === 'kampus' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{user.name || user.email.split('@')[0]}</h4>
                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 flex flex-col items-end gap-1">
                      <span className="flex items-center gap-1"><Clock size={12}/> {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System & AI Monitoring */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-sm border border-slate-800 text-white relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
          
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2"><Activity size={24} className="text-blue-400" /> Monitoring Sistem & AI</h2>
              <p className="text-sm text-slate-400 mt-1">Status real-time performa engine AI-Recruit Pro</p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${aiStats.status === 'Online' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
              {aiStats.status === 'Online' && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute"></div>}
              <div className={`w-2 h-2 rounded-full relative ${aiStats.status === 'Online' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
              {aiStats.status === 'Online' ? 'All Systems Operational' : 'System Offline / Unreachable'}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-semibold">
                <Server size={16} /> Server Uptime
              </div>
              <div className="text-2xl font-bold text-white">{aiStats.uptime}</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-semibold">
                <Activity size={16} /> API Latency
              </div>
              <div className="text-2xl font-bold text-white">{aiStats.latency}</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-semibold">
                <Cpu size={16} /> AI Engine Tokens
              </div>
              <div className="text-2xl font-bold text-white">{aiStats.tokenUsage}</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-semibold">
                <Database size={16} /> Parsed CVs
              </div>
              <div className="text-2xl font-bold text-white">{aiStats.parsedCVs}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

