'use client';

import React, { useState } from 'react';
import Toast from '@/components/Toast';
import { SiteProfile } from '@/lib/mockDb';

export default function ContactClient({ profile }: { profile: SiteProfile }) {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    hp: '',
    pesan: '',
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi.';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid.';
    }

    const hpNumeric = formData.hp.replace(/\D/g, '');
    if (!formData.hp.trim()) {
      newErrors.hp = 'Nomor HP wajib diisi.';
    } else if (hpNumeric.length < 10) {
      newErrors.hp = 'Nomor HP minimal 10 digit.';
    }

    if (!formData.pesan.trim()) newErrors.pesan = 'Pesan wajib diisi.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setToast({
          message: 'Pesan terkirim, tim kami akan menghubungi Anda.',
          type: 'success',
        });
        setFormData({ nama: '', email: '', hp: '', pesan: '' });
      } else {
        setToast({
          message: data.error || 'Terjadi kesalahan saat mengirim pesan.',
          type: 'error',
        });
      }
    } catch (err) {
      setToast({
        message: 'Gagal menghubungi server.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0D0D0D] min-h-screen py-32 px-6 md:px-12 relative overflow-hidden noise-bg">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_30%,rgba(201,169,97,0.05),transparent)]" />
      <div className="absolute top-1/4 right-1/10 w-96 h-96 bg-[#C9A961]/3 rounded-full blur-3xl animate-float" />

      <div className="absolute top-32 left-12 w-16 h-16 border-l border-t border-[#C9A961]/25" />
      <div className="absolute top-32 right-12 w-16 h-16 border-r border-t border-[#C9A961]/25" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        
        <div className="flex flex-col items-center text-center gap-4 mb-20">
          <span className="text-[11px] font-bold text-[#C9A961] tracking-[0.3em] uppercase flex items-center gap-3">
            <span className="h-px w-8 bg-[#C9A961]" />
            Hubungi Kami
            <span className="h-px w-8 bg-[#C9A961]" />
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
            Hubungi <span className="text-gold-gradient">{profile.nama_perusahaan}</span>
          </h1>
          <div className="flex items-center gap-3 w-32 justify-center mt-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C9A961]" />
            <span className="text-[#C9A961] text-xs">◆</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C9A961]" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          <div className="flex flex-col gap-8">
            <div className="glass-card rounded-lg p-8 border border-white/5 shadow-2xl flex flex-col gap-8">
              <h2 className="font-serif font-bold text-2xl text-white">Informasi Kantor</h2>
              
              <div className="flex flex-col gap-6 text-xs text-gray-300">
                <div className="flex items-start gap-4">
                  <span className="h-8 w-8 rounded bg-[#C9A961]/10 flex items-center justify-center text-sm border border-[#C9A961]/20">📍</span>
                  <div>
                    <p className="font-bold text-white uppercase tracking-wider text-[10px] text-[#C9A961]">Alamat Kantor</p>
                    <p className="mt-1 text-gray-400 font-light leading-relaxed whitespace-pre-wrap">{profile.alamat}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="h-8 w-8 rounded bg-[#C9A961]/10 flex items-center justify-center text-sm border border-[#C9A961]/20">📞</span>
                  <div>
                    <p className="font-bold text-white uppercase tracking-wider text-[10px] text-[#C9A961]">Telepon / Email</p>
                    <p className="mt-1 text-gray-400 font-light">{profile.telepon_display} | {profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="h-8 w-8 rounded bg-emerald-500/10 flex items-center justify-center text-sm border border-emerald-500/20">💬</span>
                  <div>
                    <p className="font-bold text-white uppercase tracking-wider text-[10px] text-emerald-400">WhatsApp Agen Utama</p>
                    <a 
                      href={`https://wa.me/${profile.whatsapp}?text=Halo%20${encodeURIComponent(profile.nama_perusahaan)},%20saya%20tertarik%20dengan%20listing%20Anda.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 mt-1 transition-colors"
                    >
                      Hubungi WA ({profile.whatsapp_display}) ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-lg overflow-hidden border border-white/5 shadow-2xl h-80 relative group">
              <iframe
                title={`Lokasi Kantor ${profile.nama_perusahaan}`}
                src={profile.maps_embed_url}
                className="absolute inset-0 w-full h-full border-0 filter grayscale invert contrast-90 opacity-80 group-hover:opacity-100 group-hover:filter-none transition-all duration-700"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          <div className="glass-card rounded-lg p-8 border border-[#C9A961]/15 shadow-2xl flex flex-col gap-8 justify-between">
            <div>
              <h2 className="font-serif font-bold text-2xl text-white">Kirim Pesan</h2>
              <p className="text-xs text-gray-400 mt-2 font-light">Isi formulir di bawah ini, agen profesional kami akan segera menghubungi Anda.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#C9A961] uppercase tracking-wider text-[10px]">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap Anda"
                  className={`bg-[#1A1A1A]/50 border rounded-sm p-3 text-white placeholder-gray-600 focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm transition-all ${
                    errors.nama ? 'border-[#B33A3A]' : 'border-white/10'
                  }`}
                />
                {errors.nama && <span className="text-[#B33A3A] font-bold mt-1 text-[10px]">{errors.nama}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#C9A961] uppercase tracking-wider text-[10px]">Alamat Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="nama@email.com"
                  className={`bg-[#1A1A1A]/50 border rounded-sm p-3 text-white placeholder-gray-600 focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm transition-all ${
                    errors.email ? 'border-[#B33A3A]' : 'border-white/10'
                  }`}
                />
                {errors.email && <span className="text-[#B33A3A] font-bold mt-1 text-[10px]">{errors.email}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#C9A961] uppercase tracking-wider text-[10px]">Nomor HP / WhatsApp</label>
                <input
                  type="text"
                  name="hp"
                  value={formData.hp}
                  onChange={handleInputChange}
                  placeholder="Contoh: 081234567890"
                  className={`bg-[#1A1A1A]/50 border rounded-sm p-3 text-white placeholder-gray-600 focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm transition-all ${
                    errors.hp ? 'border-[#B33A3A]' : 'border-white/10'
                  }`}
                />
                {errors.hp && <span className="text-[#B33A3A] font-bold mt-1 text-[10px]">{errors.hp}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#C9A961] uppercase tracking-wider text-[10px]">Pesan Anda</label>
                <textarea
                  name="pesan"
                  rows={4}
                  value={formData.pesan}
                  onChange={handleInputChange}
                  placeholder="Bagaimana kami bisa membantu rencana investasi properti Anda?"
                  className={`bg-[#1A1A1A]/50 border rounded-sm p-3 text-white placeholder-gray-600 focus:border-[#C9A961] focus:ring-1 focus:ring-[#C9A961] focus:outline-none text-sm transition-all ${
                    errors.pesan ? 'border-[#B33A3A]' : 'border-white/10'
                  }`}
                />
                {errors.pesan && <span className="text-[#B33A3A] font-bold mt-1 text-[10px]">{errors.pesan}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold py-4 px-6 rounded-sm text-xs mt-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase font-black tracking-widest cursor-pointer"
              >
                {loading ? 'Mengirim...' : 'Kirim Pesan Layanan'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
