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
      <title>TREM 擴充</title>
      <meta name="description" content="TREM 擴充套件一覽" />
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
