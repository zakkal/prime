'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[#0D0D0D]/95 backdrop-blur-md py-3 border-b border-[#C9A961]/30 shadow-2xl shadow-black/80'
        : 'bg-[#0D0D0D]/75 backdrop-blur-md py-5 border-b border-white/5 shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">

        {/* Brand Logo */}
        <Link href="/">
          <Logo light={true} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-12 lg:gap-16">
          {[
            { href: '/', label: 'Beranda' },
            { href: '/about', label: 'Tentang Kami' },
            { href: '/contact', label: 'Kontak' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[11px] font-black tracking-[0.25em] uppercase transition-all duration-300 relative group ${
                isActive(item.href) ? 'text-[#C9A961]' : 'text-gray-300 hover:text-white'
              }`}
            >
              {item.label}
              <span className={`absolute -bottom-1.5 left-0 h-px bg-gradient-to-r from-[#C9A961] to-transparent transition-all duration-300 ${
                isActive(item.href) ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          ))}
        </nav>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Link
            href="/agent/login"
            className="hidden sm:block btn-outline-gold text-[10px] font-black tracking-[0.2em] px-6 py-3 rounded-xl uppercase"
          >
            Login Agent
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`block h-0.5 bg-[#C9A961] transition-all duration-300 ${menuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`}></span>
            <span className={`block h-0.5 bg-[#C9A961] transition-all duration-300 ${menuOpen ? 'opacity-0 w-0' : 'w-4'}`}></span>
            <span className={`block h-0.5 bg-[#C9A961] transition-all duration-300 ${menuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-6'}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass-dark border-t border-[#C9A961]/10 px-6 py-6 flex flex-col gap-5 animate-fade-in">
          {[
            { href: '/', label: 'Beranda' },
            { href: '/about', label: 'Tentang Kami' },
            { href: '/contact', label: 'Kontak' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`text-xs font-black tracking-widest uppercase py-1.5 ${
                isActive(item.href) ? 'text-[#C9A961]' : 'text-gray-300'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/agent/login"
            onClick={() => setMenuOpen(false)}
            className="btn-outline-gold text-[10px] py-3.5 rounded-xl text-center font-black tracking-widest"
          >
            Login Agent
          </Link>
        </div>
      )}
    </header>
  );
}
