import React from 'react';
import { loginAgent } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import { getAuthenticatedAgent } from '@/lib/auth';

export const revalidate = 0;

export default async function LoginPage() {
  // If already authenticated, redirect to dashboard
  const agent = await getAuthenticatedAgent();
  if (agent) {
    redirect('/agent/dashboard');
  }

  // Server Action for handling login (AC-5.1)
  const handleLoginAction = async (formData: FormData) => {
    'use server';

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, error: 'Email dan password wajib diisi.' };
    }

    const res = await loginAgent(email, password);
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
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative group">
            <div className="bg-gradient-to-br from-[#A8893E] via-[#C9A961] to-[#E2C785] text-black font-black h-12 w-12 rounded flex items-center justify-center text-xl shadow-lg transition-transform group-hover:scale-105">
              P
            </div>
            <div className="absolute inset-0 bg-[#C9A961]/25 rounded blur-md -z-10 group-hover:blur-lg" />
          </div>
          
          <h1 className="text-xl font-extrabold tracking-[0.2em] text-white uppercase mt-2">
            PRIME <span className="text-gold-gradient">PORTAL</span>
          </h1>
          <div className="h-px w-16 divider-gold opacity-35" />
          <p className="text-[9px] text-[#C9A961] font-black uppercase tracking-[0.25em]">Internal Agent Portal</p>
        </div>

        {/* Form Client Wrapper */}
        <LoginForm action={handleLoginAction} />
      </div>
    </div>
  );
}
