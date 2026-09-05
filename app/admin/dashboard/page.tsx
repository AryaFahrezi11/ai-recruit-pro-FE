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
          { name: 'Pelamar', value: roles.pelamar, color: '#1E4B9F' }, 
          { name: 'Perusahaan', value: roles.perusahaan, color: '#059669' },
          { name: 'Kampus', value: roles.kampus, color: '#D97706' },
          { name: 'Admin', value: roles.admin, color: '#4F46E5' },
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
    { label: 'Total Pengguna', value: stats.totalUsers, icon: Users },
    { label: 'Total Pelamar', value: stats.pelamar, icon: UserPlus },
    { label: 'Perusahaan Terdaftar', value: stats.perusahaan, icon: Building2 },
    { label: 'Kampus Mitra', value: stats.kampus, icon: GraduationCap },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 font-sans antialiased">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Overview Sistem</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">Pantau performa, analitik, dan statistik terbaru platform AI-RecruitPro</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800">
          <Calendar size={16} className="text-black dark:text-white" />
          <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Pending Action Alerts */}
      {!isLoading && stats.pendingVerifications > 0 && (
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
              <AlertCircle size={20} className="text-black dark:text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Butuh Perhatian Admin</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 max-w-xl font-medium leading-relaxed">
                Ada <strong className="text-slate-900 dark:text-white font-bold">{stats.pendingVerifications} perusahaan</strong> baru yang mendaftar dan menunggu proses verifikasi legalitas (NIB/NPWP).
              </p>
            </div>
          </div>
          <Link href="/admin/verifikasi" className="whitespace-nowrap px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer">
            Tinjau Sekarang
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse h-32"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{stat.value.toLocaleString('id-ID')}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <stat.icon size={22} className="text-black dark:text-white shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* METRIK LOWONGAN PEKERJAAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Job Metrics Cards */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Metrik Lowongan</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ringkasan aktivitas lamaran</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-black dark:text-white rounded-xl border border-slate-200 dark:border-slate-700"><Briefcase size={18} className="text-black dark:text-white" /></div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Lowongan Aktif</div>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{isLoading ? '-' : jobMetrics.activeJobs}</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-black dark:text-white rounded-xl border border-slate-200 dark:border-slate-700"><Archive size={18} className="text-black dark:text-white" /></div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Lowongan Ditutup</div>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{isLoading ? '-' : jobMetrics.closedJobs}</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-black dark:text-white rounded-xl border border-slate-200 dark:border-slate-700"><FileText size={18} className="text-black dark:text-white" /></div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Lamaran</div>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{isLoading ? '-' : jobMetrics.totalApplications}</div>
            </div>
          </div>
        </div>

        {/* 7 Day Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Tren Lamaran (7 Hari)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Jumlah pelamar harian seminggu terakhir</p>
            </div>
          </div>
          
          <div className="h-[250px] w-full">
            {isLoading ? (
              <div className="w-full h-full bg-slate-50 dark:bg-slate-800 animate-pulse rounded-xl"></div>
            ) : jobMetrics.trend7Days.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
                <Activity size={28} className="mb-2 text-black dark:text-white" />
                Belum ada data lamaran minggu ini
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobMetrics.trend7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="lamaran" fill="#1E4B9F" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ANALYTICS CHARTS DARI LAPORAN & ANALITIK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Pertumbuhan Pendaftar Baru</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Statistik pendaftaran 6 bulan terakhir</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="w-full h-full bg-slate-50 dark:bg-slate-800 animate-pulse rounded-xl"></div>
            ) : registrations.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-medium">Belum ada data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={registrations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                  <Bar dataKey="kandidat" name="Kandidat" fill="#1E4B9F" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="perusahaan" name="Perusahaan" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Jobs Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Tren Lowongan Pekerjaan</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pertumbuhan lowongan aktif dan ditutup</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="w-full h-full bg-slate-50 dark:bg-slate-800 animate-pulse rounded-xl"></div>
            ) : jobsData.length === 0 ? (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-medium">Belum ada data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={jobsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="total" name="Total Lowongan" stroke="#64748B" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="active" name="Lowongan Aktif" stroke="#1E4B9F" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="closed" name="Berhasil Diisi" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* CHARTS USER & RECENT USERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Roles Pie Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="mb-6">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Distribusi Pengguna</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Persentase pengguna berdasarkan peran</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {isLoading ? (
               <div className="w-48 h-48 rounded-full border-8 border-slate-100 dark:border-slate-800 animate-pulse"></div>
            ) : roleData.length === 0 ? (
               <p className="text-slate-400 text-xs font-medium">Belum ada data</p>
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
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4 w-full">
                  {roleData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
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
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Pendaftar Terbaru</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pengguna yang baru bergabung</p>
            </div>
            <Link href="/admin/users" className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-black dark:text-white rounded-xl transition-colors border border-slate-200 dark:border-slate-700">
              <ArrowRight size={16} className="text-black dark:text-white" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: '300px' }}>
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2 animate-pulse"></div>
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-10 font-medium">
                <Users size={36} className="mb-2 text-black dark:text-white" />
                <p className="text-xs">Belum ada pengguna terbaru</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user, idx) => (
                  <div key={user.id || idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{user.name || user.email.split('@')[0]}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize font-medium">{user.role}</p>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 flex flex-col items-end gap-1 font-medium">
                      <span className="flex items-center gap-1"><Clock size={12} className="text-black dark:text-white" /> {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* System Monitoring */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={20} className="text-black dark:text-white" /> Monitoring Performa System & Engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Status real-time infrastruktur AI-RecruitPro</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 text-xs font-bold">
                <Server size={15} className="text-black dark:text-white" /> Server Uptime
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">{aiStats.uptime}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 text-xs font-bold">
                <Activity size={15} className="text-black dark:text-white" /> API Latency
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">{aiStats.latency}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 text-xs font-bold">
                <Cpu size={15} className="text-black dark:text-white" /> Engine Tokens
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">{aiStats.tokenUsage}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 text-xs font-bold">
                <Database size={15} className="text-black dark:text-white" /> Parsed CVs
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">{aiStats.parsedCVs}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

