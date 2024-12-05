'use client';

import { Book, Home, Moon, Store, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

const NavigationHeader = () => {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  const handleDarkModeToggle = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem('darkMode', String(newValue));
      document.documentElement.classList.toggle('dark', newValue);
      return newValue;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  return (
    <div className="border-b">
      <div className={`
        container mx-auto flex items-center justify-between px-4 py-4
      `}
      >
        <div className="flex space-x-4">
          <Link href="/">
            <Button
              variant={pathname === '/' ? 'default' : 'ghost'}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              首頁
            </Button>
          </Link>
          <Link href="/store">
            <Button
              variant={pathname.startsWith('/store') || pathname.startsWith('/plugins') ? 'default' : 'ghost'}
              className="flex items-center gap-2"
            >
              <Store className="h-4 w-4" />
              擴充
            </Button>
          </Link>
          <Link href="https://exptechtw.github.io/TREM-docs">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
            >
              <Book className="h-4 w-4" />
              文件
            </Button>
          </Link>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleDarkModeToggle}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default NavigationHeader;
