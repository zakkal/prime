'use client';

import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-lg shadow-xl text-xs font-bold tracking-wide animate-slide-in transition-all border ${
      type === 'success'
        ? 'bg-[#1A1A1A] border-[#C9A961] text-[#C9A961]'
        : 'bg-[#B33A3A] border-[#B33A3A]/40 text-white'
    }`}>
      <span className="text-sm">{type === 'success' ? '✨' : '⚠️'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:scale-110 font-bold opacity-70 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}
