'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  ShieldBan,
  ShieldCheck,
  Plus,
  Edit2,
  X,
  AlertCircle,
  Eye,
  BadgeCheck,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  CornerDownLeft,
  Building2,
  Briefcase,
  Users,
  FileText,
  CreditCard,
  ExternalLink,
  Globe,
  Phone,
  MapPin,
  Calendar,
  FileCheck2,
  GraduationCap,
  Award,
  Share2,
  FileSpreadsheet,
  Sparkles,
  UserCheck,
  Mail,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { getMediaUrl } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { DataTable, ColumnDef } from '@/components/ui/DataTable';

interface UserItem {
  id: string;
  email: string;
  role: string;
  name: string;
  is_active: boolean;
  is_banned: boolean;
  is_verified?: boolean;
  verification_status?: 'VERIFIED' | 'REJECTED' | 'PENDING' | 'UNVERIFIED';
  rejection_reason?: string;
  created_at: string;
}

interface SkillGroup {
  category: string;
  items: string[];
}

interface EducationEntry {
  school?: string;
  institution?: string;
  degree?: string;
  period?: string;
  gpa?: string;
}

interface ExperienceEntry {
  company?: string;
  role?: string;
  period?: string;
  description?: string;
}

interface CertificationEntry {
  name?: string;
  credentialUrl?: string;
  issuer?: string;
  year?: string;
}

interface SocialLinkEntry {
  platform?: string;
  url?: string;
}

function parseSkills(raw: any): { isCategorized: boolean; categories: SkillGroup[]; list: string[] } {
  if (!raw) return { isCategorized: false, categories: [], list: [] };
  let data = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch {
      const list = raw.split(/[,;\n]+/).map((s: string) => s.trim()).filter(Boolean);
      return { isCategorized: false, categories: [], list };
    }
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object' && (data[0].category || data[0].items)) {
      const categories: SkillGroup[] = data.map((cat: any) => {
        const catName = cat.category || 'Kategori Keahlian';
        let items: string[] = [];
        if (typeof cat.items === 'string') {
          items = cat.items
            .split(/[,;\n]+/)
            .map((s: string) => s.trim().replace(/^\./, '').replace(/\.$/, ''))
            .filter(Boolean);
        } else if (Array.isArray(cat.items)) {
          items = cat.items.map((s: any) => String(s).trim()).filter(Boolean);
        }
        return { category: catName, items };
      }).filter(c => c.items.length > 0);

      return { isCategorized: true, categories, list: [] };
    } else {
      const list = data.map((item: any) => typeof item === 'string' ? item : item.name || String(item)).filter(Boolean);
      return { isCategorized: false, categories: [], list };
    }
  }

  return {
    isCategorized: false,
    categories: [],
    list: String(raw).split(/[,;\n]+/).map((s: string) => s.trim()).filter(Boolean)
  };
}

function parseEducation(raw: any): EducationEntry[] {
  if (!raw) return [];
  let data = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch {
      return [{ school: raw }];
    }
  }
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') return [data];
  return [];
}

function parseExperience(raw: any): ExperienceEntry[] {
  if (!raw) return [];
  let data = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch {
      return [{ description: raw }];
    }
  }
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') return [data];
  return [];
}

function parseCertifications(raw: any): CertificationEntry[] {
  if (!raw) return [];
  let data = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch {
      return [{ name: raw }];
    }
  }
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') return [data];
  return [];
}

function parseSocialLinks(raw: any): SocialLinkEntry[] {
  if (!raw) return [];
  let data = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (Array.isArray(data)) return data;
  return [];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [showRawCvText, setShowRawCvText] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    password: '',
    role: 'pelamar',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = async (searchQuery: string = activeSearch, roleQuery: string = filterRole) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleQuery) params.append('role', roleQuery);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const url = params.toString() ? `/api/admin/users?${params.toString()}` : '/api/admin/users';
      const res = await fetchAuth(url, { method: 'GET' });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setUsers([]);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadUsers(activeSearch, filterRole);
  }, [filterRole]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setCurrentPage(1);
    loadUsers(searchInput, filterRole);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    setCurrentPage(1);
    loadUsers('', filterRole);
  };

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
    setShowRawCvText(false);
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

  // Helper untuk merender status verifikasi akun yang selaras dengan halaman verifikasi perusahaan
  const renderAccountStatus = (u: UserItem) => {
    if (u.role === 'perusahaan') {
      const status = u.verification_status || (u.is_verified ? 'VERIFIED' : 'PENDING');
      if (status === 'VERIFIED') {
        return (
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            Verified
          </span>
        );
      }
      if (status === 'REJECTED') {
        return (
          <span
            className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-800/60"
            title={u.rejection_reason || 'Verifikasi perusahaan ditolak'}
          >
            <XCircle size={13} className="text-rose-600 dark:text-rose-400 shrink-0" />
            Ditolak
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800/60">
          <Clock size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
          Belum Verifikasi
        </span>
      );
    }

    if (u.role === 'kampus') {
      if (u.is_verified) {
        return (
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            Verified
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800/60">
          <Clock size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
          Belum Verifikasi
        </span>
      );
    }

    // Role Pelamar / Admin
    return u.is_active ? (
      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800/60">
        <BadgeCheck size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" /> Verified
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
        Unverified
      </span>
    );
  };

  // DataTable Column Definitions
  const tableColumns: ColumnDef<UserItem>[] = [
    {
      key: 'no',
      header: 'No',
      align: 'center',
      className: 'w-12 text-center text-slate-500 dark:text-slate-400 font-semibold',
      headerClassName: 'w-12 text-center',
      render: (_, index) => index + 1
    },
    {
      key: 'name_email',
      header: 'Pengguna',
      align: 'left',
      render: (u) => (
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
            {u.name || u.email}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 truncate">
            {u.email}
          </span>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Peran (Role)',
      align: 'left',
      render: (u) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            u.role === 'pelamar'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              : u.role === 'perusahaan'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1A4B9F] dark:text-blue-300 border border-blue-200 dark:border-blue-900'
              : u.role === 'kampus'
              ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
              : 'bg-black text-white'
          }`}
        >
          {u.role}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status Akun',
      align: 'left',
      render: (u) => renderAccountStatus(u)
    },
    {
      key: 'banned',
      header: 'Banned',
      align: 'left',
      render: (u) =>
        u.is_banned ? (
          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 text-xs font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
            <ShieldBan size={14} className="text-rose-700 dark:text-rose-400" /> BANNED
          </span>
        ) : (
          <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
        )
    },
    {
      key: 'aksi',
      header: 'Aksi',
      align: 'right',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (u) => (
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
            title={u.is_banned ? 'Unban User' : 'Ban User'}
            className="p-1.5 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            {u.is_banned ? (
              <ShieldCheck size={15} className="text-black dark:text-white" />
            ) : (
              <ShieldBan size={15} className="text-black dark:text-white" />
            )}
          </button>
          <button
            onClick={() => handleDelete(u.id)}
            title="Hapus Permanen"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:text-rose-600 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans antialiased">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Manajemen Pengguna
            </h1>
            {!isLoading && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {users.length} Akun
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
            Kelola akses, verifikasi, edit peran, blokir, dan hapus pengguna platform.
          </p>
        </div>

        {/* Toolbar: GET Search, Role Filter, Refresh, Tambah Pengguna */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Search Form via GET */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari nama, email, peran..."
                className="w-full pl-9 pr-20 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-800 dark:text-slate-200 shadow-xs"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Hapus pencarian"
                >
                  <X size={13} />
                </button>
              )}
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono inline-flex items-center gap-0.5 select-none pointer-events-none">
                <CornerDownLeft size={10} /> Enter
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-3.5 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Cari (GET)"
            >
              <Search size={13} />
              <span className="hidden sm:inline">Cari</span>
            </button>
          </form>

          {/* Filter Role */}
          <div className="relative shrink-0">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black dark:text-white" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-8 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none font-semibold shadow-xs cursor-pointer"
            >
              <option value="">Semua Peran</option>
              <option value="pelamar">Pelamar</option>
              <option value="perusahaan">Perusahaan</option>
              <option value="kampus">Universitas</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadUsers(activeSearch, filterRole)}
            disabled={isLoading}
            title="Muat Ulang"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {/* Tambah Pengguna Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-black hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <Plus size={16} className="text-white" />
            <span className="hidden sm:inline">Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Active Search Filter Banner */}
      {activeSearch && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Hasil pencarian pengguna: <strong className="font-bold underline">&ldquo;{activeSearch}&rdquo;</strong> ({users.length} pengguna ditemukan)
            </span>
          </div>
          <button
            onClick={handleClearSearch}
            className="text-xs text-blue-700 dark:text-blue-400 hover:underline font-bold inline-flex items-center gap-1 shrink-0 ml-3 cursor-pointer"
          >
            <X size={13} /> Reset Filter
          </button>
        </div>
      )}

      {/* Reusable DataTable Component with 10 Rows Pagination */}
      <DataTable<UserItem>
        data={users}
        columns={tableColumns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        pageSize={10}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        emptyTitle={activeSearch ? 'Tidak Ada Pengguna Ditemukan' : 'Belum Ada Pengguna'}
        emptyDescription={
          activeSearch
            ? `Tidak ada data pengguna yang cocok dengan kata kunci "${activeSearch}".`
            : 'Belum ada data pengguna yang terdaftar untuk filter ini.'
        }
      />

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
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 font-sans antialiased">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center font-bold">
                  {selectedUserDetail?.role === 'perusahaan' ? <Building2 size={18} /> : <Eye size={18} />}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Detail Informasi Pengguna
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {selectedUserDetail?.role === 'perusahaan'
                      ? 'Profil & Berkas Legalitas Perusahaan'
                      : 'Data akun dan profil sistem'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
              >
                <X size={18} className="text-black dark:text-white" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {isDetailLoading || !selectedUserDetail ? (
                <div className="py-16 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-blue-600" />
                  <span>Memuat detail pengguna dari database...</span>
                </div>
              ) : selectedUserDetail.role === 'perusahaan' ? (
                /* TAMPILAN DETAIL LENGKAP KHUSUS PERUSAHAAN */
                <div className="space-y-5">
                  {/* Header Identity & Status Banner */}
                  <div className="flex items-start gap-3.5 bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1A4B9F] dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center font-black text-base shrink-0">
                      {selectedUserDetail.profile?.nama_perusahaan
                        ? selectedUserDetail.profile.nama_perusahaan.slice(0, 2).toUpperCase()
                        : <Building2 size={22} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base truncate">
                        {selectedUserDetail.profile?.nama_perusahaan || selectedUserDetail.email}
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                        {selectedUserDetail.email}
                      </span>
                      <div className="flex flex-wrap gap-2 items-center mt-2">
                        <span className="text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-[#1A4B9F] dark:text-blue-300 px-2 py-0.5 rounded uppercase border border-blue-200 dark:border-blue-900">
                          PERUSAHAAN
                        </span>
                        {selectedUserDetail.profile?.is_verified ? (
                          <span className="text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full uppercase border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            Verified
                          </span>
                        ) : selectedUserDetail.profile?.status === 'REJECTED' ? (
                          <span className="text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2.5 py-0.5 rounded-full uppercase border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                            <XCircle size={13} className="text-rose-600 dark:text-rose-400 shrink-0" />
                            Ditolak
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full uppercase border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                            <Clock size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                            Belum Verifikasi
                          </span>
                        )}

                        {selectedUserDetail.is_banned && (
                          <span className="text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded uppercase border border-rose-200 dark:border-rose-800">
                            Banned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rejection Alert If Rejected */}
                  {selectedUserDetail.profile?.status === 'REJECTED' && (
                    <div className="p-3.5 bg-rose-50/90 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-300 flex items-start gap-2.5">
                      <XCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Catatan Penolakan Admin:</strong>
                        <p className="mt-0.5 text-rose-700 dark:text-rose-300">
                          {selectedUserDetail.profile?.rejection_reason || 'Persyaratan dokumen legalitas belum memenuhi kriteria.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Deskripsi Perusahaan */}
                  {selectedUserDetail.profile?.deskripsi && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Deskripsi Perusahaan
                      </span>
                      <p className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedUserDetail.profile.deskripsi}
                      </p>
                    </div>
                  )}

                  {/* Grid Data Lengkap Perusahaan */}
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      Rincian Legalitas &amp; Profil
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Sektor */}
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sektor Industri</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-1">
                          <Briefcase size={14} className="text-blue-500 shrink-0" />
                          {selectedUserDetail.profile?.industri || '-'}
                        </span>
                      </div>

                      {/* Skala Karyawan */}
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Skala Karyawan</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-1">
                          <Users size={14} className="text-emerald-500 shrink-0" />
                          {selectedUserDetail.profile?.ukuran || '-'}
                        </span>
                      </div>

                      {/* Nomor NIB */}
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor NIB / NPWP</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-100 block mt-1">
                          {selectedUserDetail.profile?.nib_number || '-'}
                        </span>
                      </div>

                      {/* Tahun Berdiri */}
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tahun Berdiri</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 block mt-1">
                          {selectedUserDetail.profile?.tahun_berdiri || '-'}
                        </span>
                      </div>

                      {/* HR Name */}
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Perwakilan HRD</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 block mt-1">
                          {selectedUserDetail.profile?.hr_name || '-'}
                        </span>
                      </div>

                      {/* HR Position */}
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jabatan HRD</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 capitalize block mt-1">
                          {selectedUserDetail.profile?.hr_position || '-'}
                        </span>
                      </div>

                      {/* HR WhatsApp */}
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp HRD</span>
                        {selectedUserDetail.profile?.hr_whatsapp ? (
                          <a
                            href={`https://wa.me/${selectedUserDetail.profile.hr_whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 hover:underline font-mono font-bold inline-flex items-center gap-1 mt-1"
                          >
                            <Phone size={12} /> {selectedUserDetail.profile.hr_whatsapp}
                          </a>
                        ) : (
                          <span className="text-slate-400 block mt-1">-</span>
                        )}
                      </div>

                      {/* Telepon Kantor */}
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Telepon Kantor</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-100 block mt-1">
                          {selectedUserDetail.profile?.no_telepon || '-'}
                        </span>
                      </div>

                      {/* Website */}
                      <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Website Resmi</span>
                        {selectedUserDetail.profile?.website_url ? (
                          <a
                            href={
                              selectedUserDetail.profile.website_url.startsWith('http')
                                ? selectedUserDetail.profile.website_url
                                : `https://${selectedUserDetail.profile.website_url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1 mt-1 break-all"
                          >
                            <Globe size={13} /> {selectedUserDetail.profile.website_url} <ExternalLink size={11} />
                          </a>
                        ) : (
                          <span className="text-slate-400 block mt-1">-</span>
                        )}
                      </div>

                      {/* Alamat */}
                      <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alamat Lengkap</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium block mt-1 leading-relaxed">
                          {[
                            selectedUserDetail.profile?.alamat,
                            selectedUserDetail.profile?.kota,
                            selectedUserDetail.profile?.provinsi
                          ]
                            .filter(Boolean)
                            .join(', ') || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PREVIEW DOKUMEN FISIK: NIB / NPWP & ID CARD HR */}
                  <div className="pt-2">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2.5">
                      Preview Berkas Dokumen Persyaratan
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Dokumen NIB/NPWP */}
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1A4B9F] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/60">
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-900 dark:text-white text-xs block truncate">
                              Dokumen NIB / NPWP
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                              {selectedUserDetail.profile?.nib_document_url ? 'Berkas digital terunggah' : 'Belum diunggah'}
                            </span>
                          </div>
                        </div>

                        {selectedUserDetail.profile?.nib_document_url ? (
                          <div className="space-y-2">
                            {/* Preview image jika format gambar */}
                            {/\.(jpg|jpeg|png|webp)$/i.test(selectedUserDetail.profile.nib_document_url) && (
                              <div className="h-32 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative">
                                <img
                                  src={getMediaUrl(selectedUserDetail.profile.nib_document_url)}
                                  alt="Preview NIB"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <a
                              href={getMediaUrl(selectedUserDetail.profile.nib_document_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center justify-center gap-1.5"
                            >
                              <Eye size={13} />
                              <span>Lihat / Buka NIB</span>
                              <ExternalLink size={11} />
                            </a>
                          </div>
                        ) : (
                          <div className="py-4 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs">
                            Dokumen NIB tidak tersedia
                          </div>
                        )}
                      </div>

                      {/* Dokumen ID Card HR */}
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-900/60">
                            <CreditCard size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-900 dark:text-white text-xs block truncate">
                              KTP / ID Card HRD
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                              {selectedUserDetail.profile?.hr_id_card_url ? 'Berkas digital terunggah' : 'Belum diunggah'}
                            </span>
                          </div>
                        </div>

                        {selectedUserDetail.profile?.hr_id_card_url ? (
                          <div className="space-y-2">
                            {/* Preview image jika format gambar */}
                            {/\.(jpg|jpeg|png|webp)$/i.test(selectedUserDetail.profile.hr_id_card_url) && (
                              <div className="h-32 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative">
                                <img
                                  src={getMediaUrl(selectedUserDetail.profile.hr_id_card_url)}
                                  alt="Preview ID Card HR"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <a
                              href={getMediaUrl(selectedUserDetail.profile.hr_id_card_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center justify-center gap-1.5"
                            >
                              <Eye size={13} />
                              <span>Lihat / Buka ID Card</span>
                              <ExternalLink size={11} />
                            </a>
                          </div>
                        ) : (
                          <div className="py-4 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs">
                            ID Card HR tidak tersedia
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedUserDetail.role === 'pelamar' ? (() => {
                const profile = selectedUserDetail.profile || {};
                const skillsData = parseSkills(profile.keahlian);
                const educations = parseEducation(profile.riwayat_pendidikan);
                const experiences = parseExperience(profile.pengalaman_kerja);
                const certifications = parseCertifications(profile.sertifikasi);
                const socialLinks = parseSocialLinks(profile.social_links);
                const latestCv = profile.latest_cv;

                return (
                  <div className="space-y-5">
                    {/* Header Identity & Status */}
                    <div className="flex items-start gap-3.5 bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-center font-black text-base shrink-0">
                        {profile.nama_lengkap
                          ? profile.nama_lengkap.slice(0, 2).toUpperCase()
                          : selectedUserDetail.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base truncate">
                          {profile.nama_lengkap || selectedUserDetail.email}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail size={12} className="text-slate-400 shrink-0" />
                            {selectedUserDetail.email}
                          </span>
                          {profile.no_telepon && (
                            <span className="flex items-center gap-1">
                              • <Phone size={12} className="text-slate-400 shrink-0" />
                              {profile.no_telepon}
                            </span>
                          )}
                          {profile.judul_posisi && (
                            <span className="flex items-center gap-1">
                              • <Briefcase size={12} className="text-blue-500 shrink-0" />
                              <strong className="font-semibold text-slate-700 dark:text-slate-200">{profile.judul_posisi}</strong>
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 items-center mt-2.5">
                          <span className="text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded uppercase border border-emerald-200 dark:border-emerald-800">
                            PELAMAR
                          </span>
                          {selectedUserDetail.is_active ? (
                            <span className="text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full uppercase border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                              <BadgeCheck size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                              Verified
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full uppercase border border-slate-200 dark:border-slate-700">
                              Unverified
                            </span>
                          )}
                          {selectedUserDetail.is_banned && (
                            <span className="text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded uppercase border border-rose-200 dark:border-rose-800">
                              Banned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dokumen CV Utama Pelamar */}
                    <div>
                      <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                        Dokumen Curriculum Vitae (CV)
                      </span>
                      {latestCv ? (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/60">
                              <FileText size={22} />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-sm" title={latestCv.nama_file}>
                                {latestCv.file_url === 'profil-dashboard'
                                  ? 'Profil CV Digital Standar ATS'
                                  : latestCv.nama_file}
                              </h5>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                {latestCv.file_url === 'profil-dashboard'
                                  ? 'Dihasilkan dan tersinkronisasi otomatis dari profil pelamar'
                                  : `Ukuran: ${latestCv.file_size_kb ? `${latestCv.file_size_kb} KB` : '-'} • Tipe: ${(latestCv.file_type || 'PDF').toUpperCase()}`}
                              </span>
                            </div>
                          </div>

                          {latestCv.file_url && latestCv.file_url !== 'profil-dashboard' ? (
                            <a
                              href={getMediaUrl(latestCv.file_url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                            >
                              <Eye size={13} />
                              <span>Buka / Unduh Berkas CV</span>
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800/80 inline-flex items-center gap-1.5 shrink-0">
                              <CheckCircle2 size={14} className="text-emerald-500" />
                              ATS Digital Ready
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs">
                          <FileText size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-1.5" />
                          Pelamar belum mengunggah dokumen CV ke sistem.
                        </div>
                      )}
                    </div>

                    {/* Ringkasan Diri / Bio */}
                    {profile.ringkasan_diri && (
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Ringkasan Profesional
                        </span>
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal text-justify">
                          {profile.ringkasan_diri}
                        </div>
                      </div>
                    )}

                    {/* Pengalaman Kerja */}
                    <div>
                      <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <Briefcase size={14} className="text-emerald-600 dark:text-emerald-400" />
                        Pengalaman Kerja
                      </span>
                      {experiences.length > 0 ? (
                        <div className="space-y-2.5">
                          {experiences.map((exp, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                                  {exp.role || 'Posisi'}
                                  {exp.company ? <span className="font-semibold text-slate-500 dark:text-slate-400"> — {exp.company}</span> : ''}
                                </h5>
                                {exp.period && (
                                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-700/60 px-2 py-0.5 rounded-full w-fit">
                                    {exp.period}
                                  </span>
                                )}
                              </div>
                              {exp.description && (
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-2.5 border-l-2 border-emerald-500/40 whitespace-pre-line text-justify font-normal">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 italic">
                          Belum ada data pengalaman kerja tercatat.
                        </div>
                      )}
                    </div>

                    {/* Riwayat Pendidikan */}
                    <div>
                      <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <GraduationCap size={14} className="text-blue-600 dark:text-blue-400" />
                        Riwayat Pendidikan
                      </span>
                      {educations.length > 0 ? (
                        <div className="space-y-2.5">
                          {educations.map((edu, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                                  {edu.degree || 'Pendidikan Formal'}
                                </h5>
                                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium block mt-0.5">
                                  {edu.school || edu.institution || '-'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {edu.gpa && (
                                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                                    IPK: {edu.gpa}
                                  </span>
                                )}
                                {edu.period && (
                                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-700/60 px-2 py-0.5 rounded-full">
                                    {edu.period}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 italic">
                          Belum ada data riwayat pendidikan tercatat.
                        </div>
                      )}
                    </div>

                    {/* Keahlian & Keterampilan */}
                    <div>
                      <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-blue-500" />
                        Keahlian &amp; Keterampilan
                      </span>
                      {skillsData.isCategorized && skillsData.categories.length > 0 ? (
                        <div className="space-y-2.5">
                          {skillsData.categories.map((cat, cIdx) => (
                            <div key={cIdx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                                {cat.category}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {cat.items.map((skill, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-200 dark:border-blue-900/60 shadow-2xs inline-flex items-center gap-1"
                                  >
                                    <Sparkles size={10} className="text-blue-500 shrink-0" />
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : skillsData.list.length > 0 ? (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5">
                          {skillsData.list.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-200 dark:border-blue-900/60 shadow-2xs inline-flex items-center gap-1"
                            >
                              <Sparkles size={10} className="text-blue-500 shrink-0" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 italic">
                          Belum ada keahlian tercantum.
                        </div>
                      )}
                    </div>

                    {/* Sertifikasi & Lisensi */}
                    {certifications.length > 0 && (
                      <div>
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                          <Award size={14} className="text-amber-500" />
                          Sertifikasi &amp; Lisensi
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {certifications.map((cert, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                                  {cert.name || 'Sertifikat Keahlian'}
                                </span>
                                {cert.issuer && (
                                  <span className="text-[10px] text-slate-400 block">{cert.issuer}</span>
                                )}
                              </div>
                              {cert.credentialUrl && (
                                <a
                                  href={cert.credentialUrl.startsWith('http') ? cert.credentialUrl : `https://${cert.credentialUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-[11px] font-bold rounded-lg border border-amber-200 dark:border-amber-800 shrink-0 inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Bukti</span>
                                  <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Kontak & Tautan Profil */}
                    <div>
                      <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                        Kontak &amp; Tautan Profil
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Telepon */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">No. WhatsApp / HP</span>
                          {profile.no_telepon ? (
                            <a
                              href={`https://wa.me/${profile.no_telepon.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 hover:underline font-mono font-bold inline-flex items-center gap-1 mt-1"
                            >
                              <Phone size={12} /> {profile.no_telepon}
                            </a>
                          ) : (
                            <span className="text-slate-400 block mt-1">-</span>
                          )}
                        </div>

                        {/* Judul Posisi */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Posisi</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-1">
                            <Briefcase size={13} className="text-blue-500 shrink-0" />
                            {profile.judul_posisi || '-'}
                          </span>
                        </div>

                        {/* LinkedIn */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profil LinkedIn</span>
                          {profile.linkedin_url ? (
                            <a
                              href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1 mt-1 truncate max-w-full"
                            >
                              <Share2 size={12} /> Profil LinkedIn <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-slate-400 block mt-1">-</span>
                          )}
                        </div>

                        {/* Portofolio */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Portofolio / Website</span>
                          {profile.portfolio_url ? (
                            <a
                              href={profile.portfolio_url.startsWith('http') ? profile.portfolio_url : `https://${profile.portfolio_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1 mt-1 truncate max-w-full"
                            >
                              <Globe size={12} /> Buka Portofolio <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-slate-400 block mt-1">-</span>
                          )}
                        </div>

                        {/* Social Links Lainnya */}
                        {socialLinks.length > 0 && (
                          <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Tautan Tambahan</span>
                            <div className="flex flex-wrap gap-2">
                              {socialLinks.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.url ? (link.url.startsWith('http') ? link.url : `https://${link.url}`) : '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs"
                                >
                                  <Globe size={11} /> {link.platform ? `${link.platform}: ` : ''}{link.url} <ExternalLink size={9} />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Alamat */}
                        <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Domisili / Alamat</span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium block mt-1 flex items-center gap-1.5">
                            <MapPin size={13} className="text-rose-500 shrink-0" />
                            {profile.alamat || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Teks Hasil Ekstraksi CV (Collapsible) */}
                    {latestCv?.extracted_text && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setShowRawCvText(!showRawCvText)}
                          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>{showRawCvText ? 'Sembunyikan Teks Mentah CV' : 'Lihat Teks Mentah Hasil Ekstraksi CV (Raw ATS)'}</span>
                          {showRawCvText ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        {showRawCvText && (
                          <div className="mt-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto font-mono text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                            {latestCv.extracted_text}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })() : (
                /* TAMPILAN UMUM (Kampus, Admin, dll) */
                <div className="space-y-6">
                  {/* Executive Header Identity Card */}
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl flex items-center justify-center font-extrabold text-lg uppercase border border-slate-200 dark:border-slate-700 shrink-0">
                      {selectedUserDetail.email ? selectedUserDetail.email.charAt(0) : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base truncate">
                        {selectedUserDetail.email}
                      </h4>
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
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                      Informasi Profil Database
                    </h4>
                    {!selectedUserDetail.profile || Object.keys(selectedUserDetail.profile).length === 0 ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center font-medium">
                        Profil belum diisi atau tidak tersedia di database.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(selectedUserDetail.profile).map(([key, value]) => (
                          <div key={key} className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 break-words leading-relaxed">
                              {(() => {
                                if (value === true) return 'Ya';
                                if (value === false) return 'Tidak';
                                if (value === null || value === undefined || value === '') return '-';
                                if (typeof value === 'object') {
                                  return Array.isArray(value)
                                    ? value.map((v: any) => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ')
                                    : JSON.stringify(value);
                                }
                                if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
                                  try {
                                    const parsed = JSON.parse(value);
                                    if (Array.isArray(parsed)) {
                                      return parsed.map((item: any) => typeof item === 'object' ? (item.name || item.title || item.school || item.company || JSON.stringify(item)) : String(item)).join(', ');
                                    }
                                  } catch {}
                                }
                                return String(value);
                              })()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
