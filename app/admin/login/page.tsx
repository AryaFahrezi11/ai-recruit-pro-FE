'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store/useAppStore';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { loginUser, fetchAuth } from '@/lib/api/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const setToken = useAppStore((state) => state.setToken);
  const setUser = useAppStore((state) => state.setUser);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await loginUser(email, password, 'admin');
      if (response.user.role !== 'admin') {
        toast.error('Akses ditolak. Akun Anda bukan admin.');
        setIsLoading(false);
        return;
      }
      
      setToken(response.access_token);
      setUser(response.user);
      toast.success('Login Admin Berhasil');
      router.push('/admin');
    } catch (error: any) {
      const errorMsg = error.message === 'Failed to fetch' 
        ? 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' 
        : (error.message || 'Gagal login. Periksa kembali email dan kata sandi.');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Portal Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Sistem Manajemen AI-Recruit Pro</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Email Administrator</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="admin@airecruitpro.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Kata Sandi Khusus</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? 'Memverifikasi...' : 'Akses Sistem'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
