'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Download, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import type Plugin from '@/modal/plugin';

interface InstallButtonsProps {
  plugin: Plugin;
}

interface NavigatorWithProtocols extends Navigator {
  msProtocolsHandler?: boolean;
}

export function InstallButtons({ plugin }: InstallButtonsProps) {
  const [mounted, setMounted] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkAppInstalled = () => {
      try {
        const nav = navigator as NavigatorWithProtocols;
        if (nav.msProtocolsHandler) {
          setIsAppInstalled(true);
          return;
        }

        if ('registerProtocolHandler' in nav) {
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
  const tremUrl = `trem-lite://plugin/install:${plugin.name}@${downloadUrl}`;

  const handleTremOpen = () => {
    setShowDialog(true);
  };

  const handleConfirm = () => {
    window.location.href = tremUrl;
    setShowDialog(false);
  };

  return (
    <>
      <div className="space-y-2">
        {mounted && isAppInstalled
          ? (
              <>
                <Button className="w-full" onClick={handleTremOpen}>
                  <Download className="mr-2 h-4 w-4" />
                  下載至 TREM-Lite
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <a href={downloadUrl} download>
                    <Download className="mr-2 h-4 w-4" />
                    下載最新版本
                  </a>
                </Button>
              </>
            )
          : (
              <Button className="w-full" asChild>
                <a href={downloadUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  下載最新版本
                </a>
              </Button>
            )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
              <DialogTitle>安裝擴充前請確認</DialogTitle>
            </div>
            <DialogDescription>
              請確保 TREM Lite 已經啟動才能安裝擴充。是否繼續安裝？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              <X className="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button onClick={handleConfirm}>
              <Download className="mr-2 h-4 w-4" />
              確認安裝
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
