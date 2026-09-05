'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus, Edit, Trash2, Database, LayoutTemplate, Briefcase, AlertTriangle } from 'lucide-react';
import { fetchAuth } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';

interface Category {
  id: string;
  nama_kategori: string;
  deskripsi: string | null;
}

function MasterDataContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'kategori' | 'skill'>((searchParams.get('tab') as any) || 'kategori');
  
  // Category State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<{ id?: string, nama_kategori: string, deskripsi: string }>({ nama_kategori: '', deskripsi: '' });
  
  // Delete Confirm State
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string, name: string }>({ isOpen: false, id: '', name: '' });

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAuth('/api/admin/categories');
      if (!res.ok) throw new Error('Gagal memuat kategori');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Gagal mengambil data kategori');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'kategori') {
      loadCategories();
    }
  }, [activeTab, searchParams]);

  const handleOpenModal = (mode: 'add' | 'edit', category?: Category) => {
    setModalMode(mode);
    if (mode === 'edit' && category) {
      setFormData({ id: category.id, nama_kategori: category.nama_kategori, deskripsi: category.deskripsi || '' });
    } else {
      setFormData({ nama_kategori: '', deskripsi: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_kategori.trim()) return toast.error('Nama kategori harus diisi');

    const loadingToast = toast.loading(modalMode === 'add' ? 'Menyimpan...' : 'Memperbarui...');
    try {
      const url = modalMode === 'add' ? '/api/admin/categories' : `/api/admin/categories/${formData.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const res = await fetchAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama_kategori: formData.nama_kategori, deskripsi: formData.deskripsi })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Gagal menyimpan data');
      }

      toast.success(modalMode === 'add' ? 'Kategori berhasil ditambahkan' : 'Kategori berhasil diperbarui', { id: loadingToast });
      setIsModalOpen(false);
      loadCategories();
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    const loadingToast = toast.loading('Menghapus...');
    try {
      const res = await fetchAuth(`/api/admin/categories/${confirmDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Gagal menghapus data');
      }
      toast.success('Kategori berhasil dihapus', { id: loadingToast });
      setConfirmDelete({ isOpen: false, id: '', name: '' });
      loadCategories();
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const filteredCategories = categories.filter(c => 
    c.nama_kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.deskripsi && c.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="text-blue-600" /> Master Data
          </h1>
          <p className="text-slate-500 text-sm mt-1">Kelola data referensi seperti Kategori Pekerjaan.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab('kategori');
            updateUrlParams({ tab: 'kategori' });
          }}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'kategori' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <LayoutTemplate size={16} />
          Kategori Lowongan
        </button>
      </div>

      {activeTab === 'kategori' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <form 
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                updateUrlParams({ search: searchQuery });
              }}
            >
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-4 py-2 w-64 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Cari
              </button>
            </form>
            <button 
              onClick={() => handleOpenModal('add')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> Tambah Kategori
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">Nama Kategori</th>
                    <th className="px-6 py-4">Deskripsi</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Memuat data...</td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Tidak ada kategori ditemukan.</td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat, index) => (
                      <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-500 font-medium">{index + 1}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">{cat.nama_kategori}</td>
                        <td className="px-6 py-4 text-slate-600">{cat.deskripsi || '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleOpenModal('edit', cat)}
                              title="Edit Kategori"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => setConfirmDelete({ isOpen: true, id: cat.id, name: cat.nama_kategori })}
                              title="Hapus Kategori"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
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
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {modalMode === 'add' ? 'Tambah Kategori' : 'Edit Kategori'}
              </h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Kategori <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={formData.nama_kategori}
                  onChange={(e) => setFormData({...formData, nama_kategori: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Misal: Software Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Deskripsi</label>
                <textarea 
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Opsional: Penjelasan singkat mengenai kategori ini"
                />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirm Modal */}
      {confirmDelete.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmDelete({ isOpen: false, id: '', name: '' })} />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 mb-4 mx-auto">
                <AlertTriangle className="text-rose-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
                Hapus Kategori
              </h3>
              <p className="text-slate-500 text-sm text-center mb-6">
                Yakin ingin menghapus kategori <span className="font-bold text-slate-700">"{confirmDelete.name}"</span>? 
                Data yang terhubung mungkin akan terdampak (akan dikosongkan pada lowongan yang bersangkutan).
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete({ isOpen: false, id: '', name: '' })}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 rounded-lg text-white font-semibold text-sm bg-rose-500 hover:bg-rose-600 transition-colors shadow-sm"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MasterDataPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
      <MasterDataContent />
    </Suspense>
  );
}
