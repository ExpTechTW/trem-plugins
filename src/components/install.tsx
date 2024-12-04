'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Plugin } from '@/modal/plugin';

interface InstallButtonsProps {
  plugin: Plugin;
}

export function InstallButtons({ plugin }: InstallButtonsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!plugin.repository.releases.releases.length) {
    return null;
  }

  const downloadUrl = `https://github.com/${plugin.repository.full_name}/releases/latest/download/${plugin.name}.trem`;
  const tremUrl = `trem-lite://plugin/install/${plugin.name}`;

  const handleTremOpen = () => {
    window.location.href = tremUrl;
  };

  const checkProtocol = () => {
    if (!mounted) return false;
    try {
      const testLink = document.createElement('a');
      testLink.href = 'trem-lite://test';
      return testLink.href === 'trem-lite://test';
    }
    catch {
      return false;
    }
  };

  const showTremButton = checkProtocol();

  return (
    <div className="space-y-2">
      <Button className="w-full" asChild>
        <a href={downloadUrl} download>
          下載最新版本
        </a>
      </Button>

      {mounted && showTremButton && (
        <Button
          className="w-full"
          variant="secondary"
          onClick={handleTremOpen}
        >
          用 TREM-Lite 開啟
        </Button>
      )}
    </div>
  );
}
