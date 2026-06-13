import React from 'react';

export default function AboutPage() {
  return (
    <div className="bg-[#0D0D0D] min-h-screen py-32 px-6 md:px-12 relative overflow-hidden noise-bg">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_30%,rgba(201,169,97,0.05),transparent)]" />
      <div className="absolute top-1/3 left-1/10 w-96 h-96 bg-[#C9A961]/3 rounded-full blur-3xl animate-float" />
      
      {/* Decorative corners */}
      <div className="absolute top-32 left-12 w-16 h-16 border-l border-t border-[#C9A961]/25" />
      <div className="absolute top-32 right-12 w-16 h-16 border-r border-t border-[#C9A961]/25" />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        
        {/* Page Title */}
        <div className="flex flex-col items-center text-center gap-4 mb-20">
          <span className="text-[11px] font-bold text-[#C9A961] tracking-[0.3em] uppercase flex items-center gap-3">
            <span className="h-px w-8 bg-[#C9A961]" />
            Profil Perusahaan
            <span className="h-px w-8 bg-[#C9A961]" />
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
            Tentang <span className="text-gold-gradient">Prime Property</span>
          </h1>
          <div className="flex items-center gap-3 w-32 justify-center mt-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C9A961]" />
            <span className="text-[#C9A961] text-xs">◆</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C9A961]" />
          </div>
        </div>

        {/* 2-Column Responsive Layout (AC-3.1) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text Profile */}
          <div className="flex flex-col gap-6 animate-slide-in-left">
            <span className="text-[10px] font-extrabold tracking-widest text-[#C9A961] uppercase">Established Agency</span>
            <h2 className="text-3xl font-serif font-bold text-white leading-tight">
              Menghadirkan Dimensi Baru <br />
              <span className="text-gold-gradient">Dalam Layanan Properti</span>
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Prime Property adalah pemimpin pasar regional dalam penyediaan dan pengelolaan inventori properti komersial, ruko strategis, serta hunian villa eksklusif. Sejak didirikan, kami berdedikasi untuk menjembatani agen pemasaran, pengembang, dan pembeli dengan transparansi data inventori penuh.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Kami memprioritaskan integrasi teknologi, ketepatan detail data fisik bangunan, dan kemudahan filter pencarian kawasan guna memfasilitasi transaksi properti yang ringkas, cepat, dan terpercaya di seluruh penjuru kota Medan.
            </p>
          </div>

          {/* Right Column: Visual Quote (Premium Card) */}
          <div className="glass-card text-white p-10 rounded-lg relative overflow-hidden border border-[#C9A961]/20 shadow-2xl group">
            {/* Ambient gold glow */}
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#C9A961]/10 rounded-full blur-3xl group-hover:bg-[#C9A961]/15 transition-all duration-500" />
            <div className="absolute right-6 top-6 text-[#C9A961]/10 font-serif text-[120px] pointer-events-none select-none leading-none">
              “
            </div>
            
            <div className="relative z-10 flex flex-col gap-6">
              <span className="text-[#C9A961] text-xs font-bold uppercase tracking-widest">Motto Kami</span>
              <p className="font-serif text-lg md:text-xl leading-relaxed text-gray-100 italic">
                &ldquo;Memberikan akurasi data inventori tanpa kompromi, menghadirkan rasa aman bagi setiap agen dan klien kami.&rdquo;
              </p>
              
              <div className="divider-gold opacity-20 w-full" />
              
              <div>
                <p className="text-sm font-bold text-[#C9A961]">Direksi Prime Property</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Medan, Indonesia</p>
              </div>
            </div>
          </div>

        </div>

        {/* Vision & Mission Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-24 pt-16 border-t border-white/5">
          <div className="glass rounded-lg p-8 border border-white/5 hover:border-[#C9A961]/30 transition-all duration-300">
            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-3">
              <span className="h-8 w-8 rounded bg-[#C9A961]/10 flex items-center justify-center text-sm border border-[#C9A961]/20">🎯</span> 
              Visi Kami
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Menjadi agensi properti terdepan di Indonesia yang mengedepankan keterbukaan informasi, integritas data inventori ruko dan villa, serta efisiensi pemasaran berbasis teknologi modern.
            </p>
          </div>

          <div className="glass rounded-lg p-8 border border-white/5 hover:border-[#C9A961]/30 transition-all duration-300">
            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-3">
              <span className="h-8 w-8 rounded bg-[#C9A961]/10 flex items-center justify-center text-sm border border-[#C9A961]/20">🚀</span> 
              Misi Kami
            </h3>
            <ul className="text-xs text-gray-400 space-y-3 font-light leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-[#C9A961] mt-0.5">◆</span>
                <span>Menyajikan basis data inventori properti yang komprehensif, akurat, dan diperbarui secara real-time.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#C9A961] mt-0.5">◆</span>
                <span>Memberikan pelatihan serta akses alat bantu terbaik bagi tim agen internal.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#C9A961] mt-0.5">◆</span>
                <span>Membangun hubungan jangka panjang dengan nasabah melalui integritas pelayanan profesional.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

