import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { readSiteProfile } from '@/lib/mockDb';

export default function Footer() {
  const profile = readSiteProfile();

  return (
    <footer className="bg-[#0D0D0D] border-t border-white/5 relative overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-[#C9A961]/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-16 bg-[#C9A961]/5 blur-2xl" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-10">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Brand Col — wider */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Logo */}
            <Link href="/" className="w-fit">
              <Logo light={true} />
            </Link>

            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Portal inventori properti komersial eksklusif — Villa dan Ruko premium di kawasan strategis Medan dengan data akurat dan status real-time.
            </p>

            {/* Social / Contact quick links */}
            <div className="flex flex-col gap-3 text-xs text-gray-500">
              <a href={`tel:${profile.telepon}`} className="flex items-center gap-2 hover:text-[#C9A961] transition-colors">
                <span className="text-[#C9A961]">📞</span>
                {profile.telepon_display}
              </a>
              <a
                href={`https://wa.me/${profile.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-[#C9A961] transition-colors"
              >
                <span className="text-[#C9A961]">💬</span>
                WhatsApp: {profile.whatsapp_display}
              </a>
              <a href={`mailto:${profile.email}`} className="flex items-center gap-2 hover:text-[#C9A961] transition-colors">
                <span className="text-[#C9A961]">✉️</span>
                {profile.email}
              </a>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-2" />

          {/* Nav Links */}
          <div className="md:col-span-2 flex flex-col gap-5">
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-[#C9A961]">Navigasi</h4>
            <ul className="flex flex-col gap-3">
              {[
                { href: '/', label: 'Beranda' },
                { href: '/about', label: 'Tentang Kami' },
                { href: '/contact', label: 'Hubungi Kami' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="h-px w-0 bg-[#C9A961] group-hover:w-3 transition-all duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kawasan */}
          <div className="md:col-span-2 flex flex-col gap-5">
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-[#C9A961]">Kawasan</h4>
            <ul className="flex flex-col gap-3">
              {['Krakatau', 'Pancing', 'Cemara Asri', 'Helvetia', 'Tembung', 'Kuala'].map((k) => (
                <li key={k}>
                  <span className="text-xs text-gray-600 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-[#C9A961]/40" />
                    {k}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Address */}
          <div className="md:col-span-2 flex flex-col gap-5">
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-[#C9A961]">Kantor</h4>
            <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap">
              {profile.alamat}
            </p>
            <div className="glass border border-[#C9A961]/10 rounded px-3 py-2 w-fit">
              <p className="text-[9px] text-[#C9A961] font-bold tracking-widest uppercase">{profile.hari_operasional}</p>
              <p className="text-xs text-gray-300 font-bold">{profile.jam_operasional}</p>
            </div>
          </div>
        </div>

        {/* Gold divider */}
        <div className="divider-gold mb-8 opacity-20" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-gray-600">
            &copy; {new Date().getFullYear()} {profile.nama_perusahaan}. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-700 tracking-widest uppercase">Built with</span>
            <span className="text-[#C9A961] text-xs">◆</span>
            <span className="text-[10px] text-gray-700 tracking-widest uppercase">Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
