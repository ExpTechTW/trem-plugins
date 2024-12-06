'use client';

import { useEffect } from 'react';

import AppFooter from '@/components/footer';
import AppHeader from '@/components/header';
import { TooltipProvider } from '@/components/ui/tooltip';

import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/noto-sans-tc/400.css';
import '@fontsource/noto-sans-tc/700.css';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
      document.documentElement.classList.add('dark');
    }
    else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <html lang="zh-Hant">
      <title>TREM 臺灣即時地震監測</title>
      <meta name="description" content="Taiwan Real-time Earthquake Monitoring" />
      <body className="flex min-h-svh flex-col">
        <TooltipProvider>
          <AppHeader />
          <main className="flex-1 pb-8">
            {children}
          </main>
          <AppFooter />
        </TooltipProvider>
      </body>
    </html>
  );
}
