'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, Trash2, ShieldBan, ShieldCheck, Plus, Edit2, X, AlertCircle, Eye, BadgeCheck, CheckCircle2 } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    password: '',
    role: 'pelamar',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const url = filterRole ? `/api/admin/users?role=${filterRole}` : '/api/admin/users';
      const res = await fetchAuth(url, { method: 'GET' });
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data && Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (data && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        setUsers([]);
        if (!res.ok && data?.detail) {
          toast.error(data.detail);
        }
      }
    } catch (error) {
      setUsers([]);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filterRole]);

  const handleBan = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await fetchAuth(`/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_banned: newStatus })
      });
      toast.success(`User berhasil di-${newStatus ? 'Banned' : 'Unbanned'}`);
      loadUsers();
    } catch (error) {
      toast.error('Gagal mengubah status banned');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Yakin ingin menghapus pengguna ini secara permanen? Semua data terkait (CV, Lamaran, dsb) akan ikut terhapus.')) return;

    try {
      await fetchAuth(`/api/admin/users/${userId}`, { method: 'DELETE' });
      toast.success('Pengguna berhasil dihapus permanen');
      loadUsers();
    } catch (error) {
      toast.error('Gagal menghapus pengguna');
    }
  };

  const resetForm = () => {
    setFormData({ id: '', email: '', password: '', role: 'pelamar', name: '' });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setFormData({
      id: user.id,
      email: user.email,
      password: '', // won't update password here
      role: user.role,
      name: user.name || ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDetail = async (userId: string) => {
    setIsDetailModalOpen(true);
    setIsDetailLoading(true);
    try {
      const res = await fetchAuth(`/api/admin/users/${userId}/detail`, { method: 'GET' });
      const data = await res.json();
      setSelectedUserDetail(data);
    } catch (error) {
      toast.error('Gagal memuat detail pengguna');
      setIsDetailModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetchAuth('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          name: formData.name
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Gagal menambahkan user');
      }

      toast.success('Pengguna baru berhasil ditambahkan');
      setIsAddModalOpen(false);
      loadUsers();
    } catch (error: any) {
      const errorMsg = error.message === 'Failed to fetch'
        ? 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
        : (error.message || 'Gagal menambahkan pengguna');
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetchAuth(`/api/admin/users/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
          name: formData.name
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Gagal mengubah user');
      }

      toast.success('Data pengguna berhasil diperbarui');
      setIsEditModalOpen(false);
      loadUsers();
    } catch (error: any) {
      const errorMsg = error.message === 'Failed to fetch'
        ? 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
        : (error.message || 'Gagal memperbarui pengguna');
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans antialiased">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Manajemen Pengguna</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">Kelola akses, edit, blokir, dan hapus pengguna platform.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white" />
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-8 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none font-semibold"
            >
              <option value="">Semua Peran</option>
              <option value="pelamar">Pelamar</option>
              <option value="perusahaan">Perusahaan</option>
              <option value="kampus">Universitas</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-black hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={16} className="text-white" />
            Tambah Pengguna
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-center">No</th>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Peran (Role)</th>
                <th className="px-6 py-4">Status Akun</th>
                <th className="px-6 py-4">Banned</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium">Memuat data...</td>
                </tr>
              ) : !Array.isArray(users) || users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium">Tidak ada pengguna ditemukan.</td>
                </tr>
              ) : (
                users.map((u: any, index: number) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold text-xs">{index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{u.name || u.email}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'pelamar' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                        u.role === 'perusahaan' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                        u.role === 'admin' ? 'bg-black text-white' :
                        'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800/60">
                          <BadgeCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.is_banned ? (
                        <span className="inline-flex items-center gap-1 text-rose-700 text-xs font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <ShieldBan size={14} className="text-rose-700" /> BANNED
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenDetail(u.id)}
                            title="Lihat Detail"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                          >
                            <Eye size={15} className="text-black dark:text-white" />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(u)}
                            title="Edit Data"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                          >
                            <Edit2 size={15} className="text-black dark:text-white" />
                          </button>
                          <button 
                            onClick={() => handleBan(u.id, u.is_banned)}
                            title={u.is_banned ? "Unban User" : "Ban User"}
                            className={`p-1.5 rounded-lg transition-colors border ${u.is_banned ? 'bg-slate-100 text-black hover:bg-slate-200 border-slate-200' : 'bg-slate-100 text-black hover:bg-slate-200 border-slate-200'}`}
                          >
                            {u.is_banned ? <ShieldCheck size={15} className="text-black dark:text-white" /> : <ShieldBan size={15} className="text-black dark:text-white" />}
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id)}
                            title="Hapus Permanen"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                          >
                            <Trash2 size={15} className="text-black dark:text-white" />
                          </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah Pengguna */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 font-sans antialiased">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Tambah Pengguna Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                <X size={18} className="text-black dark:text-white" />
              </button>
            </div>
            <form onSubmit={handleSubmitAdd} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama / Profil (Awal)</label>
                <input 
                  type="text" required 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium" 
                  placeholder="Nama Lengkap / Instansi"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Aktif</label>
                <input 
                  type="email" required 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium" 
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password Sementara</label>
                <input 
                  type="password" required 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium" 
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Peran (Role)</label>
                <select 
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
                >
                  <option value="pelamar">Pelamar (Pencari Kerja)</option>
                  <option value="perusahaan">Perusahaan (Rekruter)</option>
                  <option value="kampus">Kampus (Universitas)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl flex items-start gap-2.5 border border-slate-200 dark:border-slate-700 mt-4">
                <AlertCircle size={16} className="text-black dark:text-white shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  Pengguna yang dibuat manual akan otomatis aktif tanpa perlu verifikasi OTP.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-bold text-white bg-black hover:bg-slate-800 rounded-xl disabled:opacity-50 transition-colors shadow-xs cursor-pointer">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Pengguna */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 font-sans antialiased">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Edit Data Pengguna</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                <X size={18} className="text-black dark:text-white" />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama / Profil (Awal)</label>
                <input 
                  type="text" required 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Aktif</label>
                <input 
                  type="email" required 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ubah Peran (Role)</label>
                <select 
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 font-medium"
                >
                  <option value="pelamar">Pelamar (Pencari Kerja)</option>
                  <option value="perusahaan">Perusahaan (Rekruter)</option>
                  <option value="kampus">Kampus (Universitas)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-bold text-white bg-black hover:bg-slate-800 rounded-xl disabled:opacity-50 transition-colors shadow-xs cursor-pointer">
                  {isSubmitting ? 'Menyimpan...' : 'Perbarui Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Detail Pengguna */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 font-sans antialiased">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Detail Informasi Pengguna</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                <X size={18} className="text-black dark:text-white" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              {isDetailLoading || !selectedUserDetail ? (
                <div className="py-12 text-center text-xs font-semibold text-slate-400">Memuat detail pengguna...</div>
              ) : (
                <div className="space-y-6">
                  {/* Executive Header Identity Card */}
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl flex items-center justify-center font-extrabold text-lg uppercase border border-slate-200 dark:border-slate-700 shrink-0">
                      {selectedUserDetail.email ? selectedUserDetail.email.charAt(0) : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base truncate">{selectedUserDetail.email}</h4>
                      <div className="flex flex-wrap gap-2 items-center mt-1.5">
                        <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 px-2 py-0.5 rounded uppercase border border-slate-200 dark:border-slate-700">
                          {selectedUserDetail.role}
                        </span>
                        {selectedUserDetail.is_banned && (
                          <span className="text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded uppercase border border-rose-200 dark:border-rose-800">
                            Banned
                          </span>
                        )}
                        {selectedUserDetail.is_active ? (
                          <span className="text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded uppercase border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <BadgeCheck size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded uppercase border border-slate-200 dark:border-slate-700">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Key-Value Records */}
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">Informasi Profil Database</h4>
                    {!selectedUserDetail.profile || Object.keys(selectedUserDetail.profile).length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center font-medium">Profil belum diisi atau tidak tersedia di database.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(selectedUserDetail.profile).map(([key, value]) => (
                          <div key={key} className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 break-words leading-relaxed">
                              {value === true ? 'Ya' : value === false ? 'Tidak' : (value as string) || '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
