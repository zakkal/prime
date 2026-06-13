import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prime Property | Portal Inventori Properti Eksklusif',
  description: 'Temukan Villa dan Ruko terbaik dengan sistem manajemen inventori handal dari Prime Property — agensi properti eksklusif terpercaya di Medan.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full scroll-smooth">
      <body className="min-h-full bg-[#0D0D0D] text-white flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
