import React from 'react';

export default function AboutPage() {
  return (
    <div className="bg-[#0D0D0D] min-h-screen py-16 md:py-32 px-6 md:px-12 relative overflow-hidden noise-bg">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_30%,rgba(201,169,97,0.05),transparent)]" />
      <div className="absolute top-1/3 left-1/10 w-96 h-96 bg-[#C9A961]/3 rounded-full blur-3xl animate-float" />
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
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
            Tentang <span className="text-gold-gradient">Prime Property</span>
          </h1>
          <div className="flex items-center gap-3 w-32 justify-center mt-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C9A961]" />
            <span className="text-[#C9A961] text-xs">◆</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C9A961]" />
          </div>
        </div>

        {/* Profil Narasi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="flex flex-col gap-6 animate-slide-in-left">
            <span className="text-[10px] font-extrabold tracking-widest text-[#C9A961] uppercase">Established Agency · Medan</span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight">
              Mendefinisikan Ulang Standar
              <span className="text-gold-gradient block mt-1">Properti Premium di Medan</span>
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Prime Property hadir sebagai respons terhadap kebutuhan pasar properti Medan yang semakin sophisticated — kalangan investor, pengusaha, dan keluarga mapan yang tidak sekadar mencari hunian, melainkan sebuah instrumen investasi yang terukur, transparan, dan berdaya ungkit tinggi. Sejak hari pertama beroperasi, kami membangun fondasi kepercayaan di atas satu prinsip tunggal: setiap keputusan transaksi harus didukung oleh data fisik yang presisi, legalitas yang tak terbantahkan, dan layanan konsultatif yang menjunjung privasi mutlak klien.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Hari ini, Prime Property mengelola kurasi inventori properti eksklusif — mulai dari villa premium di kawasan elite Cemara Asri hingga ruko strategis di koridor bisnis Krakatau dan Pancing — dengan sistem manajemen data real-time yang memungkinkan setiap agen dan klien mengakses informasi unit secara akurat, instan, dan tanpa distorsi. Kami bukan sekadar agen properti; kami adalah mitra strategis jangka panjang bagi setiap investor yang memahami bahwa aset riil terbaik dibangun di atas kepercayaan yang teguh.
            </p>
          </div>

          <div className="glass-card text-white p-10 rounded-lg relative overflow-hidden border border-[#C9A961]/20 shadow-2xl group">
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#C9A961]/10 rounded-full blur-3xl group-hover:bg-[#C9A961]/15 transition-all duration-500" />
            <div className="absolute right-6 top-6 text-[#C9A961]/10 font-serif text-[120px] pointer-events-none select-none leading-none">"</div>
            <div className="relative z-10 flex flex-col gap-6">
              <span className="text-[#C9A961] text-xs font-bold uppercase tracking-widest">Filosofi Kami</span>
              <p className="font-serif text-lg md:text-xl leading-relaxed text-gray-100 italic">
                &ldquo;Kemewahan sejati bukan terletak pada fasad bangunan, melainkan pada ketenangan pikiran yang lahir dari transparansi data, kepastian legalitas, dan kepercayaan yang tidak pernah dikorbankan demi komisi.&rdquo;
              </p>
              <div className="divider-gold opacity-20 w-full" />
              <div>
                <p className="text-sm font-bold text-[#C9A961]">Direksi Prime Property</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Medan, Sumatera Utara · Indonesia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visi & Misi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-16 border-t border-white/5 mb-16">
          <div className="glass rounded-lg p-8 border border-white/5 hover:border-[#C9A961]/30 transition-all duration-300">
            <h3 className="font-bold text-lg text-white mb-5 flex items-center gap-3">
              <span className="h-8 w-8 rounded bg-[#C9A961]/10 flex items-center justify-center text-sm border border-[#C9A961]/20">◈</span>
              Visi
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed font-light italic">
              Menjadi lembaga kurasi properti premium paling terpercaya di Sumatera — tempat di mana setiap transaksi dilandasi oleh integritas data, presisi legalitas, dan standar layanan VIP yang menempatkan kepentingan klien di atas segalanya.
            </p>
          </div>

          <div className="glass rounded-lg p-8 border border-white/5 hover:border-[#C9A961]/30 transition-all duration-300">
            <h3 className="font-bold text-lg text-white mb-5 flex items-center gap-3">
              <span className="h-8 w-8 rounded bg-[#C9A961]/10 flex items-center justify-center text-sm border border-[#C9A961]/20">◈</span>
              Misi
            </h3>
            <ul className="text-sm text-gray-400 space-y-4 font-light leading-relaxed">
              {[
                'Membangun dan memelihara basis data inventori properti premium yang komprehensif, terverifikasi secara fisik, dan dapat diakses secara real-time oleh seluruh ekosistem agen dan klien kami.',
                'Menjamin akurasi dimensi bangunan, keabsahan sertifikat, dan integritas data setiap unit melalui proses kurasi berlapis sebelum dipublikasikan kepada pasar.',
                'Memberikan pengalaman konsultasi investasi properti yang personal, diskret, dan bebas tekanan kepada setiap klien — tanpa agenda tersembunyi.',
                'Mengembangkan kapasitas dan kompetensi tim agen internal agar mampu menjadi konsultan properti kelas atas yang beretika, berpengetahuan luas, dan berorientasi solusi.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-[#C9A961] mt-1 text-xs">◆</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Nilai Perusahaan */}
        <div className="pt-16 border-t border-white/5">
          <div className="flex flex-col items-center text-center gap-3 mb-12">
            <span className="text-[11px] font-bold text-[#C9A961] tracking-[0.3em] uppercase flex items-center gap-3">
              <span className="h-px w-8 bg-[#C9A961]" />
              Fondasi Kami
              <span className="h-px w-8 bg-[#C9A961]" />
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
              Nilai-Nilai <span className="text-gold-gradient">Perusahaan</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                nilai: 'Integritas',
                latin: 'Integrity',
                icon: '⚖️',
                desc: 'Setiap data yang kami publikasikan adalah cerminan kenyataan di lapangan — tidak ada angka yang dipoles, tidak ada informasi yang disembunyikan demi kepentingan komersial sesaat.',
              },
              {
                nilai: 'Diskresi',
                latin: 'Discretion',
                icon: '🔒',
                desc: 'Privasi klien adalah harga mati. Seluruh informasi transaksi, identitas, dan preferensi investasi diperlakukan dengan kerahasiaan absolut sebagaimana standar layanan wealth management kelas dunia.',
              },
              {
                nilai: 'Keunggulan',
                latin: 'Excellence',
                icon: '✦',
                desc: 'Kami tidak berkompromi dengan standar biasa. Setiap aspek layanan — dari presentasi data hingga momen serah terima kunci — dirancang untuk melampaui ekspektasi klien paling demanding sekalipun.',
              },
              {
                nilai: 'Akuntabilitas',
                latin: 'Accountability',
                icon: '📋',
                desc: 'Setiap anggota tim kami bertanggung jawab penuh atas kualitas informasi dan komitmen layanan yang diberikan — karena reputasi kami dibangun satu transaksi dalam satu waktu, tanpa pengecualian.',
              },
            ].map((v, i) => (
              <div key={i} className="glass-card border border-white/5 rounded-2xl p-7 hover:border-[#C9A961]/30 transition-all duration-300 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{v.icon}</span>
                  <div>
                    <p className="font-black text-white text-base">{v.nilai}</p>
                    <p className="text-[9px] text-[#C9A961] font-bold uppercase tracking-widest">{v.latin}</p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-[#C9A961]/30 to-transparent" />
                <p className="text-xs text-gray-400 leading-relaxed font-light">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
