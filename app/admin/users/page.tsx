'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, Trash2, ShieldBan, ShieldCheck, Plus, Edit2, X, AlertCircle, Eye } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
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
      setUsers(data);
    } catch (error) {
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
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola akses, edit, blokir, dan hapus pengguna platform.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none font-medium"
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
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={16} />
            Tambah Pengguna
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Peran (Role)</th>
                <th className="px-6 py-4">Status Akun</th>
                <th className="px-6 py-4">Banned</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Memuat data...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Tidak ada pengguna ditemukan.</td>
                </tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{u.name}</span>
                        <span className="text-slate-500 text-xs">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'pelamar' ? 'bg-emerald-100 text-emerald-700' :
                        u.role === 'perusahaan' ? 'bg-violet-100 text-violet-700' :
                        u.role === 'admin' ? 'bg-slate-800 text-white' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.is_active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold"><ShieldCheck size={14}/> Verified</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-semibold">Unverified</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.is_banned ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
                          <ShieldBan size={14} /> BANNED
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenDetail(u.id)}
                            title="Lihat Detail"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(u)}
                            title="Edit Data"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleBan(u.id, u.is_banned)}
                            title={u.is_banned ? "Unban User" : "Ban User"}
                            className={`p-1.5 rounded-lg transition-colors ${u.is_banned ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-orange-50 text-orange-500 hover:bg-orange-100'}`}
                          >
                            {u.is_banned ? <ShieldCheck size={16} /> : <ShieldBan size={16} />}
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id)}
                            title="Hapus Permanen"
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={16} />
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
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Tambah Pengguna Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmitAdd} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama / Profil (Awal)</label>
                <input 
                  type="text" required 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  placeholder="Nama Lengkap / Instansi"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Aktif</label>
                <input 
                  type="email" required 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password Sementara</label>
                <input 
                  type="password" required 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Peran (Role)</label>
                <select 
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="pelamar">Pelamar (Pencari Kerja)</option>
                  <option value="perusahaan">Perusahaan (Rekruter)</option>
                  <option value="kampus">Kampus (Universitas)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 mt-4">
                <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Pengguna yang dibuat manual akan otomatis aktif tanpa perlu verifikasi OTP.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Pengguna */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Edit Data Pengguna</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama / Profil (Awal)</label>
                <input 
                  type="text" required 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Aktif</label>
                <input 
                  type="email" required 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ubah Peran (Role)</label>
                <select 
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="pelamar">Pelamar (Pencari Kerja)</option>
                  <option value="perusahaan">Perusahaan (Rekruter)</option>
                  <option value="kampus">Kampus (Universitas)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Perbarui Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Detail Pengguna */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800">Detail Pengguna</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-5 overflow-y-auto">
              {isDetailLoading || !selectedUserDetail ? (
                <div className="py-12 text-center text-slate-400">Memuat detail...</div>
              ) : (
                <div className="space-y-6">
                  {/* Info Dasar */}
                  <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                      {selectedUserDetail.email.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{selectedUserDetail.email}</h4>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">{selectedUserDetail.role}</span>
                        {selectedUserDetail.is_banned && <span className="text-xs font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded uppercase">Banned</span>}
                        {selectedUserDetail.is_active ? <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase">Verified</span> : <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">Unverified</span>}
                      </div>
                    </div>
                  </div>

                  {/* Info Profil Berdasarkan Role */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3 border-b pb-2">Informasi Profil Database</h4>
                    {Object.keys(selectedUserDetail.profile).length === 0 ? (
                      <p className="text-sm text-slate-500 italic">Profil belum diisi atau tidak tersedia.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(selectedUserDetail.profile).map(([key, value]) => (
                          <div key={key} className="bg-white p-3 rounded-lg border border-slate-200">
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-sm font-medium text-slate-800 break-words">
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
