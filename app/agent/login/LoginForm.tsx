'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  initialLockMessage?: string | null;
}

export default function LoginForm({ action, initialLockMessage }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(initialLockMessage ?? null);
  const [loading, setLoading] = useState(false);
  const isLocked = !!initialLockMessage;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await action(formData);
      if (res.success) {
        window.location.href = '/agent/dashboard';
      } else {
        setError(res.error || 'Terjadi kesalahan login.');
      }
    } catch (err) {
      setError('Koneksi terputus. Gagal menghubungi portal.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="bg-[#B33A3A]/10 text-[#B33A3A] font-bold text-xs p-3.5 rounded border border-[#B33A3A]/20 animate-fade-in">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-[#C9A961] uppercase tracking-wider text-[10px]">Email Agent</label>
          <input
            type="email"
            name="email"
            required
            disabled={isLocked}
            placeholder="nama@primeproperty.com"
            className="bg-[#1A1A1A]/50 border border-white/10 rounded-sm p-3 text-white placeholder-gray-600 focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed font-extralight tracking-wide"
            style={{ WebkitBoxShadow: '0 0 0 1000px #1A1A1A inset', WebkitTextFillColor: 'white', fontWeight: 200 }}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="font-bold text-[#C9A961] uppercase tracking-wider text-[10px]">Kata Sandi</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              disabled={isLocked}
              placeholder="••••••••"
              className="w-full bg-[#1A1A1A]/50 border border-white/10 rounded-sm p-3 pr-10 text-white placeholder-gray-600 focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed font-extralight tracking-wide"
              style={{ WebkitBoxShadow: '0 0 0 1000px #1A1A1A inset', WebkitTextFillColor: 'white', fontWeight: 200 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLocked}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs cursor-pointer select-none disabled:opacity-40"
            >
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || isLocked}
          className="btn-gold py-4 px-6 rounded-sm text-xs mt-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase font-black tracking-widest cursor-pointer"
        >
          {isLocked ? 'Akun Terkunci — Tunggu Timer' : loading ? 'Menghubungkan...' : 'Masuk Portal Agent'}
        </button>
      </form>
    </div>
  );
}
