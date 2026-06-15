import React from 'react';
import { loginAgent } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import { getAuthenticatedAgent } from '@/lib/auth';
import Logo from '@/components/Logo';
import { readLockouts } from '@/lib/mockDb';

export const revalidate = 0;

export default async function LoginPage() {
  const agent = await getAuthenticatedAgent();
  if (agent) {
    redirect('/agent/dashboard');
  }

  // Cek apakah IP saat ini sedang terkunci
  const { headers } = await import('next/headers');
  const headersList = await headers();
  const currentIp = headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
                    headersList.get('x-real-ip') ||
                    '127.0.0.1';

  const lockouts = await readLockouts();
  let globalLockMessage: string | null = null;
  const ipKey = `ip:${currentIp}`;
  const ipState = lockouts[ipKey];
  if (ipState?.lockedUntil) {
    const lockTime = new Date(ipState.lockedUntil).getTime();
    if (Date.now() < lockTime) {
      const minutesLeft = Math.ceil((lockTime - Date.now()) / 60000);
      globalLockMessage = `Terlalu banyak percobaan gagal dari perangkat ini. Coba lagi dalam ${minutesLeft} menit.`;
    }
  }

  const handleLoginAction = async (formData: FormData) => {
    'use server';
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() || 
               headersList.get('x-real-ip') || 
               '127.0.0.1';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, error: 'Email dan password wajib diisi.' };
    }

    const res = await loginAgent(email, password, ip);
    return res;
  };

  return (
    <div className="bg-[#0D0D0D] min-h-screen flex items-center justify-center p-6 relative overflow-hidden noise-bg">
      {/* Background Graphic Ornaments */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#C9A961_1px,transparent_1px),linear-gradient(to_bottom,#C9A961_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Golden radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C9A961]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-card rounded-lg border border-[#C9A961]/20 p-10 relative z-10 flex flex-col gap-8 shadow-2xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Logo Prime Property */}
          <div className="scale-150 mb-2">
            <Logo light={true} />
          </div>
          <div className="h-px w-20 divider-gold opacity-40" />
          <p className="text-[9px] text-[#C9A961] font-black uppercase tracking-[0.3em]">Internal Agent Portal</p>
        </div>

        {/* Form Client Wrapper */}
        <LoginForm action={handleLoginAction} initialLockMessage={globalLockMessage} />
      </div>
    </div>
  );
}
