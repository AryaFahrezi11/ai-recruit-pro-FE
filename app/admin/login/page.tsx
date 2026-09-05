'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAppStore } from '@/lib/store/useAppStore';
import { Shield, Lock, Mail } from 'lucide-react';
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
        : (error.message || 'Gagal login. Periksa kembali email dan password.');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 font-sans antialiased">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/Logo Ai Recruit Pro..png"
            alt="AI-RecruitPro Logo"
            width={70}
            height={70}
            className="h-14 w-auto object-contain mb-3"
            priority
          />
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Portal Admin</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Sistem Manajemen AI-RecruitPro</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Email Administrator</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                placeholder="admin@airecruitpro.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-white" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer text-sm shadow-sm"
          >
            {isLoading ? 'Memverifikasi...' : 'Akses Sistem'}
          </button>
        </form>
      </div>
    </div>
  );
}
