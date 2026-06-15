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
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Logo box — gold gradient square with black P */}
          <div className="relative group">
            <div className="relative h-20 w-20 rounded-2xl shadow-2xl overflow-hidden transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(145deg, #E2C785 0%, #C9A961 40%, #A8893E 100%)' }}
            >
              {/* Inner glow top */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-2xl" />
              <span className="absolute inset-0 flex items-center justify-center font-black text-4xl text-[#1A1A1A] tracking-tight select-none"
                style={{ fontFamily: 'Arial Black, Impact, sans-serif' }}
              >P</span>
            </div>
            {/* Outer glow */}
            <div className="absolute inset-0 bg-[#C9A961]/30 rounded-2xl blur-xl -z-10 group-hover:blur-2xl transition-all" />
          </div>

          {/* PRIME PORTAL text */}
          <div className="flex flex-col items-center gap-1.5">
            <h1 className="text-2xl font-black tracking-[0.25em] uppercase">
              <span className="text-white">PRIME </span>
              <span className="text-gold-gradient">PORTAL</span>
            </h1>
            <div className="h-px w-20 divider-gold opacity-40" />
            <p className="text-[9px] text-[#C9A961] font-black uppercase tracking-[0.3em] mt-1">Internal Agent Portal</p>
          </div>
        </div>

        {/* Form Client Wrapper */}
        <LoginForm action={handleLoginAction} />
      </div>
    </div>
  );
}
