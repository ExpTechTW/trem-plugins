'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Plugin } from '@/modal/plugin';

interface InstallButtonsProps {
  plugin: Plugin;
}

export function InstallButtons({ plugin }: InstallButtonsProps) {
  const [mounted, setMounted] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkAppInstalled = () => {
      try {
        if ((navigator as any).msProtocolsHandler) {
          setIsAppInstalled(true);
          return;
        }

        if ('registerProtocolHandler' in navigator) {
          setIsAppInstalled(true);
          return;
        }
      }
      catch {
        setIsAppInstalled(false);
      }
    };

    checkAppInstalled();
  }, []);

  if (!plugin.repository.releases.releases.length) {
    return null;
  }

  const downloadUrl = `https://github.com/${plugin.repository.full_name}/releases/latest/download/${plugin.name}.trem`;
  const tremUrl = `trem-lite://plugin/install/${plugin.name}`;

  const handleTremOpen = () => {
    window.location.href = tremUrl;
  };

  return (
    <div className="space-y-2">
      {mounted && isAppInstalled
        ? (
            <>
              <Button
                className="w-full"
                onClick={handleTremOpen}
              >
                下載至 TREM-Lite
              </Button>
              <Button
                className="w-full"
                variant="outline"
                asChild
              >
                <a href={downloadUrl} download>
                  下載最新版本
                </a>
              </Button>
            </>
          )
        : (
            <Button
              className="w-full"
              asChild
            >
              <a href={downloadUrl} download>
                下載最新版本
              </a>
            </Button>
          )}
    </div>
  );
}
