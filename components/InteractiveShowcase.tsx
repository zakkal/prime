'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Property, SiteProfile } from '@/lib/mockDb';
import { formatRupiah } from '@/lib/utils';

function Counter({ target, duration = 1200, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) return;
    const totalMiliseconds = duration;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 20);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count}{suffix}</span>;
}

interface InteractiveShowcaseProps {
  initialProperties: Property[];
  siteProfile: SiteProfile;
}

export default function InteractiveShowcase({ initialProperties, siteProfile }: { initialProperties: Property[]; siteProfile: SiteProfile }) {
  // States for interactive filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedKawasan, setSelectedKawasan] = useState<string>('All');
  const [selectedSiap, setSelectedSiap] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(5000000000); // 5 Billion max default

  // Extract unique Kawasan lists for filtering
  const kawasanList = useMemo(() => {
    const list = new Set<string>();
    initialProperties.forEach(p => p.kawasan.forEach(k => list.add(k)));
    return Array.from(list);
  }, [initialProperties]);

  // Filter properties dynamically
  const filteredProperties = useMemo(() => {
    return initialProperties.filter((prop) => {
      const matchesSearch = prop.nama_property.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (prop.group && prop.group.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === 'All' || prop.tipe === selectedType;
      const matchesKawasan = selectedKawasan === 'All' || prop.kawasan.includes(selectedKawasan);
      const matchesSiap = selectedSiap === 'All' || prop.siap === selectedSiap;
      const matchesPrice = prop.price <= priceRange;
      
      return matchesSearch && matchesType && matchesKawasan && matchesSiap && matchesPrice;
    });
  }, [initialProperties, searchQuery, selectedType, selectedKawasan, selectedSiap, priceRange]);

  // Count properties in each kawasan helper
  const getKawasanCount = (kawasanName: string) => {
    return initialProperties.filter(p => p.kawasan.includes(kawasanName)).length;
  };

  const formatDecimal = (num: number) => num.toString().replace('.', ',');

  return (
    <div className="flex flex-col gap-24 w-full">
      
      {/* ================================================================
          HERO & VIP FILTER DESK (Asymmetrical Split Screen)
      ================================================================ */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
        
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201,169,97,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,169,97,1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(201,169,97,0.06),transparent)]" />
        
        {/* Floating coordinates for luxury futuristic feel */}
        <div className="absolute top-40 right-10 text-[9px] text-gray-700 tracking-[0.4em] font-mono uppercase hidden xl:block select-none">
          SYS_LOC: 3.6377° N, 98.6947° E // MEDAN_EXP
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Side: Brand Text, Tagline & Solid Gold CTA */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left">
            <div className="inline-flex items-center gap-3 glass px-4 py-2 rounded-full w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A961] animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.25em] text-[#C9A961] uppercase">
                {siteProfile.nama_perusahaan} · Luxury Estate
              </span>
            </div>

            <h1 className="font-serif">
              <span className="block text-4xl sm:text-6xl xl:text-7xl font-black text-white leading-tight tracking-tight">
                {siteProfile.tagline_baris1}
              </span>
              <span className="block text-4xl sm:text-6xl xl:text-7xl font-black leading-tight tracking-tight text-gold-gradient">
                {siteProfile.tagline_baris2}
              </span>
            </h1>

            <p className="text-sm md:text-base text-gray-400 max-w-xl leading-relaxed font-light">
              {siteProfile.deskripsi_hero}
            </p>

            {/* Solid Gold Primary CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#unggulan"
                className="btn-gold px-10 py-4 rounded-xl text-xs font-black tracking-widest uppercase text-center shadow-lg hover:opacity-95 transition-all w-fit"
              >
                Lihat Properti
              </a>
            </div>

            <div className="flex items-center gap-8 pt-6 border-t border-white/5 max-w-md mt-2">
              <div>
                <p className="text-2xl font-black text-white">
                  <Counter target={initialProperties.length} suffix="+" />
                </p>
                <p className="text-[9px] text-[#C9A961] font-black tracking-widest uppercase">Total Properti</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-black text-white">
                  <Counter target={kawasanList.length} />
                </p>
                <p className="text-[9px] text-[#C9A961] font-black tracking-widest uppercase">Kawasan Elite</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-black text-white">
                  <Counter target={siteProfile.akurasi_dimensi} suffix=".8%" />
                </p>
                <p className="text-[9px] text-[#C9A961] font-black tracking-widest uppercase">Akurasi Dimensi</p>
              </div>
            </div>
          </div>

          {/* Right Side: Elegant Gold Geometric Accents (No Search Widget) */}
          <div className="lg:col-span-5 h-[350px] relative hidden lg:flex items-center justify-center">
            {/* Elegant overlapping circles and geometric lines */}
            <div className="absolute w-72 h-72 rounded-full border border-[#C9A961]/15 animate-rotate-slow" />
            <div className="absolute w-56 h-56 rounded-full border border-[#C9A961]/25 border-dashed" />
            <div className="absolute w-40 h-40 rounded-full border-2 border-[#C9A961]/10 bg-gradient-to-tr from-[#C9A961]/5 to-transparent" />
            
            {/* Fine intersecting lines */}
            <div className="absolute w-px h-96 bg-gradient-to-b from-transparent via-[#C9A961]/25 to-transparent transform rotate-45" />
            <div className="absolute w-px h-96 bg-gradient-to-b from-transparent via-[#C9A961]/25 to-transparent transform -rotate-45" />
            
            {/* Glowing gold dot */}
            <div className="absolute w-3 h-3 rounded-full bg-[#C9A961] animate-ping" />
            <div className="absolute w-2 h-2 rounded-full bg-[#C9A961] shadow-[0_0_12px_#C9A961]" />
          </div>

        </div>
      </section>

      {/* ================================================================
          INTERACTIVE KAWASAN SECTOR SHOWCASE
      ================================================================ */}
      <section id="kawasan" className="py-16 px-6 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col items-center text-center gap-4 mb-12">
            <span className="text-[11px] font-bold text-[#C9A961] tracking-[0.3em] uppercase flex items-center gap-3">
              <span className="h-px w-8 bg-[#C9A961]" />
              Sektor Wilayah
              <span className="h-px w-8 bg-[#C9A961]" />
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white">
              Jelajahi <span className="text-gold-gradient">Kawasan Eksklusif</span>
            </h2>
            <p className="text-xs text-gray-500 max-w-md leading-relaxed">
              Pilih kawasan di bawah untuk menyaring unit investasi terbaik secara real-time.
            </p>
          </div>

          {/* Dynamic Kawasan Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => setSelectedKawasan('All')}
              className={`p-5 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 cursor-pointer ${
                selectedKawasan === 'All'
                  ? 'bg-[#C9A961]/15 border-[#C9A961] text-[#C9A961] shadow-lg shadow-[#C9A961]/5'
                  : 'bg-[#0D0D0D] border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-lg">🌍</span>
              <p className="text-xs font-black uppercase tracking-wider mt-1">Semua Sektor</p>
              <span className="text-[9px] opacity-75 font-mono">({initialProperties.length} Unit)</span>
            </button>

            {kawasanList.map((k) => {
              const active = selectedKawasan === k;
              return (
                <button
                  key={k}
                  onClick={() => setSelectedKawasan(k)}
                  className={`p-5 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 cursor-pointer ${
                    active
                      ? 'bg-[#C9A961]/15 border-[#C9A961] text-[#C9A961] shadow-lg shadow-[#C9A961]/5'
                      : 'bg-[#0D0D0D] border-white/10 hover:border-white/20 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="text-lg">📍</span>
                  <p className="text-xs font-black uppercase tracking-wider mt-1">{k}</p>
                  <span className="text-[9px] opacity-75 font-mono">({getKawasanCount(k)} Unit)</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          DYNAMIC PROPERTIES LIST
      ================================================================ */}
      <section id="unggulan" className="py-16 px-6 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] font-bold text-[#C9A961] tracking-[0.3em] uppercase flex items-center gap-3">
                <span className="h-px w-8 bg-[#C9A961]" />
                Koleksi Terbatas
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mt-3">
                Unit Premium <span className="text-gold-gradient">Pilihan Anda</span>
              </h2>
            </div>
            
            <p className="text-xs text-gray-500 font-mono">
              Menampilkan {filteredProperties.length} dari {initialProperties.length} unit terverifikasi
            </p>
          </div>

          {/* Quick Filter Pill Badges */}
          <div className="flex flex-wrap gap-2.5 mb-8 text-xs border-b border-white/5 pb-6">
            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider self-center mr-2">Tipe:</span>
            {['All', 'Villa', 'Ruko'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-4 py-2 rounded-full font-black tracking-widest text-[9px] uppercase border cursor-pointer transition-all ${
                  selectedType === t 
                    ? 'bg-[#C9A961] text-[#1A1A1A] border-[#C9A961]' 
                    : 'bg-transparent border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {t === 'All' ? 'Semua' : t}
              </button>
            ))}

            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider self-center ml-4 mr-2">Kesiapan:</span>
            {[
              { id: 'All', label: 'Semua' },
              { id: 'siap_huni', label: 'Siap Huni' },
              { id: 'siap_kosong', label: 'Siap Kosong' },
              { id: 'siap_huni_renovasi', label: 'Siap Huni (Renovasi)' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSiap(s.id)}
                className={`px-4 py-2 rounded-full font-black tracking-widest text-[9px] uppercase border cursor-pointer transition-all ${
                  selectedSiap === s.id 
                    ? 'bg-[#C9A961] text-[#1A1A1A] border-[#C9A961]' 
                    : 'bg-transparent border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Property Cards Grid */}
          {filteredProperties.length === 0 ? (
            <div className="glass-card border border-dashed border-white/10 rounded-2xl p-16 text-center">
              <span className="text-4xl block mb-4">🔍</span>
              <h4 className="font-serif text-xl font-bold text-white mb-2">Tidak Ada Unit Yang Cocok</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Maaf, tidak ada unit properti yang memenuhi kriteria pencarian Anda. Silakan atur ulang filter pencarian Anda di atas.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('All');
                  setSelectedKawasan('All');
                  setSelectedSiap('All');
                  setPriceRange(5000000000);
                }}
                className="btn-outline-gold mt-6 px-6 py-3 rounded-xl text-[10px] font-black tracking-widest"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div key={`${selectedKawasan}-${selectedType}-${selectedSiap}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in">
              {filteredProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="glass-card hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(201,169,97,0.25)] rounded-2xl p-6 border border-[#C9A961]/15 shadow-2xl flex flex-col justify-between gap-5 relative overflow-hidden group transition-all duration-300"
                >
                  {/* Subtle hover background highlight */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#C9A961]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase border ${
                        prop.status === 'in_stock'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-[#B33A3A]/20 text-[#B33A3A] border-[#B33A3A]/30'
                      }`}>
                        {prop.status === 'in_stock' ? '● In Stock' : '○ Sold Out'}
                      </span>
                      <span className="text-[9px] font-black tracking-widest text-[#C9A961] border border-[#C9A961]/25 px-2.5 py-1 rounded-full uppercase">
                        {prop.tipe}
                      </span>
                    </div>
                    
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                      {prop.group || 'Prime Cluster'}
                    </p>
                    
                    <h3 className="font-serif text-lg font-bold text-white leading-tight mb-4 group-hover:text-[#C9A961] transition-colors">
                      {prop.nama_property}
                    </h3>
                    
                    {/* Technical details with subtle layout */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                      {[
                        { label: 'Dimensi Tanah', value: `${formatDecimal(prop.lebar)} × ${formatDecimal(prop.panjang)} m` },
                        { label: 'Hadap Arah', value: prop.hadap.join(', ') },
                        { label: 'Tingkat', value: `${formatDecimal(prop.tingkat)} Lantai` },
                        { label: 'Kawasan', value: prop.kawasan.join(', ') },
                      ].map((spec, i) => (
                        <div key={i} className="border-l border-white/5 pl-2">
                          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-0.5">{spec.label}</p>
                          <p className="font-bold text-gray-300">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mb-0.5">Harga Penawaran</p>
                        <p className="font-black text-base text-shimmer">{formatRupiah(prop.price)}</p>
                      </div>
                      <div className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest ${
                        prop.siap === 'siap_huni'
                          ? 'bg-[#C9A961] text-[#1A1A1A]'
                          : prop.siap === 'siap_kosong'
                          ? 'bg-[#DCD0FF] text-[#1A1A1A]'
                          : 'bg-[#FFE5B4] text-[#1A1A1A]'
                      }`}>
                        {prop.siap.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Global CTA below grid (AC-2.2 vs AC-7.1) */}
          <div className="flex justify-center mt-12">
            <Link
              href="/contact"
              className="btn-gold animate-btn-shimmer px-12 py-4 rounded-xl text-xs font-black tracking-widest uppercase text-center shadow-lg hover:opacity-95 transition-all"
            >
              Hubungi Agen Kami untuk Detail
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          LAYANAN VIP - High-end bespoke real estate agency services
      ================================================================ */}
      <section id="layanan" className="py-16 px-6 relative border-t border-white/5 bg-gradient-to-b from-[#0D0D0D] via-[#120F0D] to-[#0D0D0D]">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: text */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <span className="text-[11px] font-bold text-[#C9A961] tracking-[0.3em] uppercase flex items-center gap-3">
                <span className="h-px w-8 bg-[#C9A961]" />
                Layanan VIP Brokerage
              </span>
              
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight">
                Standar Layanan<br />
                <span className="text-gold-gradient">Kelas Premium</span>
              </h2>
              
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Kami melayani transaksi properti premium dengan komitmen kerahasiaan penuh, penasihat hukum internal, dan kepastian akurasi fisik unit. Setiap investor berhak mendapatkan pengalaman VIP tanpa kendala.
              </p>

              <div className="mt-4">
                <Link href="/contact" className="btn-gold px-8 py-3.5 rounded-xl text-[10px] font-black tracking-widest uppercase inline-block">
                  Konsultasi VIP Gratis
                </Link>
              </div>
            </div>

            {/* Right Column: features cards grid */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Private Viewing VIP',
                  desc: 'Penjadwalan survei lokasi privat eksklusif dengan pendampingan langsung oleh Senior Consultant kami.',
                  icon: '👑'
                },
                {
                  title: 'Presisi Legalitas',
                  desc: 'Pengecekan keabsahan SHM/HGB dan sertifikat dimensi fisik tanah dengan transparansi total.',
                  icon: '📜'
                },
                {
                  title: 'Simulasi Keuangan',
                  desc: 'Penyusunan proposal penawaran harga terbaik, simulasi KPR/KPT, dan struktur pembayaran fleksibel.',
                  icon: '📊'
                },
                {
                  title: 'Satu Pintu Layanan',
                  desc: 'Dari pemilihan unit hingga serah terima kunci dan pengurusan akta notaris dibantu tim ahli.',
                  icon: '🔑'
                }
              ].map((serv, index) => (
                <div key={index} className="glass-card border border-white/5 rounded-2xl p-6 hover:border-[#C9A961]/30 transition duration-300">
                  <div className="h-10 w-10 rounded-lg bg-[#C9A961]/10 flex items-center justify-center text-xl border border-[#C9A961]/25 mb-4">
                    {serv.icon}
                  </div>
                  <h4 className="font-bold text-sm text-white mb-2">{serv.title}</h4>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">{serv.desc}</p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
