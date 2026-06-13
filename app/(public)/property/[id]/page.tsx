import React from 'react';
import Link from 'next/link';
import { readProperties } from '@/lib/mockDb';
import { formatRupiah } from '@/lib/utils';
import { redirect } from 'next/navigation';
import EmailForm from '@/components/EmailForm';

// Mengaktifkan Static Generation untuk semua properti agar tidak ada loading render dari server
export const dynamic = 'force-static';
export const dynamicParams = true; // Tetap dukung fallback jika ada data baru

interface PageProps {
  params: Promise<{ id: string }>;
}

// Menghasilkan params secara statis saat build/startup agar navigasi instan
export async function generateStaticParams() {
  const allProperties = readProperties();
  return allProperties
    .filter((p) => p.deleted_at === null)
    .map((p) => ({
      id: p.id,
    }));
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const allProperties = readProperties();
  const property = allProperties.find((p) => p.id === id && p.deleted_at === null);

  // Jika properti tidak ditemukan atau di-soft-delete, kembalikan ke landing page
  if (!property) {
    redirect('/');
  }

  // Format angka desimal menggunakan koma khas Indonesia
  const formatDecimal = (num: number) => num.toString().replace('.', ',');

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-32 px-4 md:px-12 relative flex flex-col justify-center items-center noise-bg">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#C9A961]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C9A961]/3 rounded-full blur-3xl animate-float" />

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl w-full flex flex-col gap-8">
        
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C9A961] hover:text-[#E2C785] transition animate-fade-in"
          >
            <span className="text-sm">←</span> Kembali ke Beranda
          </Link>
          
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase border ${
              property.status === 'in_stock'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-[#B33A3A]/20 text-[#B33A3A] border-[#B33A3A]/30'
            }`}>
              {property.status === 'in_stock' ? '● In Stock' : '○ Sold Out'}
            </span>
          </div>
        </div>

        {/* Hero Banner Area */}
        <div className="relative w-full rounded-2xl overflow-hidden glass-card border border-[#C9A961]/15 p-8 md:p-12 flex flex-col justify-end min-h-[300px] shadow-2xl bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-r from-[#C9A961]/5 to-transparent opacity-50 pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-3">
            <span className="text-[10px] text-[#C9A961] font-bold uppercase tracking-[0.25em]">
              {property.group || 'Prime Cluster'} · {property.tipe}
            </span>
            <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              {property.nama_property}
            </h1>
            <p className="text-sm text-gray-400 font-light max-w-xl">
              Unit premium dengan spesifikasi fisik terbaik dan desain arsitektur modern di kawasan berkembang Medan.
            </p>
          </div>
        </div>

        {/* Content Layout split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT & CENTER COLUMN (2/3 width) - Specifications and Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Spesifikasi Fisik Box */}
            <div className="glass-card border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
              <h2 className="text-[#C9A961] text-xs font-bold tracking-[0.2em] uppercase border-b border-[#C9A961]/10 pb-4 mb-6 flex items-center gap-2">
                <span>📐</span> Spesifikasi Fisik & Konstruksi
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: (
                      <svg className="w-5 h-5 text-[#C9A961]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12" />
                      </svg>
                    ),
                    label: 'Tipe Properti',
                    value: property.tipe,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-[#C9A961]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5m0-16.5h16.5m-16.5 0L19.5 19.5M19.5 3.75v16.5m0-16.5H3.75m15.75 16.5H3.75" />
                      </svg>
                    ),
                    label: 'Dimensi Tanah',
                    value: `${formatDecimal(property.lebar)} m × ${formatDecimal(property.panjang)} m`,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-[#C9A961]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 7.5v.008H12.75V7.5zm0 2.25v.008H12.75V9.75zm0 2.25v.008H12.75V12zm0 2.25v.008H12.75V14.25zM18 10.5h.008v.008H18V10.5zm0 2.25h.008v.008H18V12.75zM6 6h.008v.008H6V6zm0 2.25h.008v.008H6V8.25zm0 2.25h.008v.008H6V10.5zm0 2.25h.008v.008H6V12.75zm-.75 5.25h12.75-12.75z" />
                      </svg>
                    ),
                    label: 'Jumlah Tingkat',
                    value: `${formatDecimal(property.tingkat)} Lantai`,
                  },
                  {
                    icon: (
                      <svg className="w-5 h-5 text-[#C9A961]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.39-6.24A2.25 2.25 0 0018.007 9.5H15m-3.75 3h1.5m-1.5-3h-1.5M10.5 6h3m-6 3h10.5M3.75 9h.007m0 2.25h.008" />
                      </svg>
                    ),
                    label: 'Fasilitas Carport',
                    value: property.carport ? 'Tersedia' : 'Tidak Ada',
                  }
                ].map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-xl">
                    <div className="p-2.5 rounded-lg bg-[#C9A961]/10 border border-[#C9A961]/25">
                      {spec.icon}
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{spec.label}</p>
                      <p className="font-bold text-white text-base mt-0.5">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lokasi & Detail Tambahan */}
            <div className="glass-card border border-white/5 rounded-2xl p-6 md:p-8 shadow-xl">
              <h2 className="text-[#C9A961] text-xs font-bold tracking-[0.2em] uppercase border-b border-[#C9A961]/10 pb-4 mb-6 flex items-center gap-2">
                <span>📍</span> Lokasi & Detail Tambahan
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {[
                  {
                    label: 'Kawasan Wilayah',
                    value: property.kawasan.join(', '),
                  },
                  {
                    label: 'Arah Hadap Bangunan',
                    value: property.hadap.join(', '),
                  },
                  {
                    label: 'Status Kesiapan Unit',
                    value: property.unit || 'Informasi Hubungi Agen',
                  },
                  {
                    label: 'Kondisi Unit',
                    value: property.siap.replace(/_/g, ' '),
                  }
                ].map((item, idx) => (
                  <div key={idx} className="border-b border-white/5 pb-4">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">
                      {item.label}
                    </span>
                    <span className="font-bold text-gray-200 text-sm">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {property.maps_link && (
                <a
                  href={property.maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-[#C9A961]/20 bg-[#C9A961]/5 hover:bg-[#C9A961]/10 text-[#C9A961] font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <span>🗺️</span> Buka Google Maps Untuk Navigasi ↗
                </a>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (1/3 width) - Sticky Contact Panel & Pricing */}
          <div className="flex flex-col gap-6">
            
            {/* Pricing Card */}
            <div className="glass-card border border-[#C9A961]/20 rounded-2xl p-6 md:p-8 shadow-2xl bg-gradient-to-br from-[#1A1410] to-[#0D0D0D]">
              <div className="mb-6">
                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">
                  Harga Penawaran Eksklusif
                </span>
                <div className="font-serif text-3xl md:text-4xl font-black text-shimmer">
                  {formatRupiah(property.price)}
                </div>
                <div className="h-px bg-gradient-to-r from-[#C9A961]/35 to-transparent w-full mt-4" />
              </div>

              {/* Agent Profile Card */}
              <div className="flex flex-col gap-4 bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#C9A961] to-[#E2C785] flex items-center justify-center font-serif text-[#1A1A1A] font-bold text-lg border-2 border-[#C9A961]">
                    DW
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-white">Darmawan Wijaya</h4>
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold">PRO</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Senior Property Consultant</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {/* WhatsApp Hubungi */}
                  <a
                    href={`https://wa.me/6281160008899?text=Halo%20Prime%20Property,%20saya%20tertarik%20dengan%20properti%20*${encodeURIComponent(property.nama_property)}*%20di%20*${encodeURIComponent(property.kawasan.join(', '))}%20(Harga:%20${encodeURIComponent(formatRupiah(property.price))})*.%20Mohon%20informasi%20lebih%20lanjut.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase transition-colors shadow-md"
                  >
                    <span className="text-xs">💬</span> WhatsApp
                  </a>

                  {/* Telepon Hubungi */}
                  <a
                    href="tel:+6281160008899"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-transparent hover:bg-white/5 border border-white/20 text-white text-[10px] font-black tracking-wider uppercase transition-colors"
                  >
                    <span className="text-xs">📞</span> Telepon
                  </a>
                </div>
              </div>

              {/* Form Kirim Email (Client Component import) */}
              <EmailForm
                propertyName={property.nama_property}
                propertyPriceFormatted={formatRupiah(property.price)}
                propertyKawasan={property.kawasan.join(', ')}
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
