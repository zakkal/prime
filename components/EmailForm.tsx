'use client';
import React, { useState } from 'react';

interface EmailFormProps {
  propertyName: string;
  propertyPriceFormatted: string;
  propertyKawasan: string;
}

export default function EmailForm({ propertyName, propertyPriceFormatted, propertyKawasan }: EmailFormProps) {
  const [userEmail, setUserEmail] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;

    setIsSending(true);
    setSendSuccess(null);
    setErrorMessage('');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyName,
          propertyPrice: propertyPriceFormatted,
          propertyKawasan,
          userEmail,
          userMessage,
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setSendSuccess(true);
        setUserEmail('');
        setUserMessage('');
      } else {
        throw new Error(resData.error || 'Gagal mengirim email');
      }
    } catch (err: any) {
      setSendSuccess(false);
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSendEmail} className="mt-4 bg-[#0D0D0D]/50 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C9A961]">
        Kirim Brosur & Info Properti
      </h3>

      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] uppercase text-gray-500 font-bold tracking-wider">Email Anda</label>
        <input
          type="email"
          required
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="nama@email.com"
          className="bg-black/50 border border-white/10 text-xs px-4 py-3 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A961]/80 focus:ring-1 focus:ring-[#C9A961]/30 transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] uppercase text-gray-500 font-bold tracking-wider">Pesan Tambahan (Opsional)</label>
        <textarea
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Halo, mohon kirimkan detail brosur dan simulasi pembayaran..."
          rows={3}
          className="bg-black/50 border border-white/10 text-xs px-4 py-3 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A961]/80 focus:ring-1 focus:ring-[#C9A961]/30 transition resize-none text-left"
        />
      </div>

      <button
        type="submit"
        disabled={isSending}
        className="btn-gold py-3 text-[10px] font-black tracking-widest uppercase rounded-xl hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
      >
        {isSending ? 'Mengirim...' : 'Kirim Brosur via Resend'}
      </button>

      {/* Notification Status */}
      {sendSuccess === true && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-bold flex items-center gap-2">
          <span>✓</span> Email berhasil terkirim melalui Resend!
        </div>
      )}
      {sendSuccess === false && (
        <div className="p-3 bg-[#B33A3A]/10 border border-[#B33A3A]/20 rounded-xl text-[10px] text-[#B33A3A] font-bold flex flex-col gap-1">
          <span>✗ Gagal mengirim email:</span>
          <span className="font-normal opacity-85">{errorMessage}</span>
        </div>
      )}
    </form>
  );
}
