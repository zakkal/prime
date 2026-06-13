import React from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export default function Logo({ className = '', light = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Precision SVG Logomark */}
      <svg 
        viewBox="0 0 50 50" 
        className="h-10 w-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Gold Chevron Arrow Up-Right */}
        <path 
          d="M 6 25 L 20 11 L 25 16 L 25 41 L 20 41 L 20 22.5 L 11 31.5 Z" 
          fill="#C9A961" 
        />
        {/* Middle Red Stripe */}
        <path 
          d="M 27.5 9 L 31.5 9 L 31.5 43 L 27.5 43 Z" 
          fill="#B33A3A" 
        />
        {/* Right Dark / White Stylized P */}
        <path 
          d="M 34 9 L 44 19 C 47.5 22.5 47.5 27.5 44 31 L 39 36 L 39 43 L 34 43 L 34 9 Z M 39 17 L 39 28 L 41.5 25.5 C 43 24 43 21 41.5 19.5 Z" 
          fill={light ? '#FFFFFF' : '#1A1A1A'} 
        />
      </svg>
      
      {/* Brand Text */}
      <div className="flex flex-col">
        <span className={`font-sans font-extrabold tracking-[0.25em] text-base leading-none transition-colors duration-300 ${light ? 'text-white' : 'text-[#1A1A1A]'}`}>
          PRIME
        </span>
        <span className="text-[9px] text-[#C9A961] font-bold tracking-[0.4em] uppercase mt-1">
          PROPERTY
        </span>
      </div>
    </div>
  );
}
