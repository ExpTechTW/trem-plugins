'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plugin } from '@/modal/plugin';

const UnsafePluginWarning = ({ plugin }: { plugin: Plugin }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!plugin.author.includes('ExpTechTW')) {
      setOpen(true);
    }
  }, [plugin]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`
              rounded-full bg-orange-50 p-2
              dark:bg-orange-900/20
            `}
            >
              <AlertTriangle className={`
                h-6 w-6 text-orange-500
                dark:text-orange-400
              `}
              />
            </div>
            <DialogTitle className="text-xl">注意</DialogTitle>
          </div>
          <DialogDescription className="mt-4 space-y-4">
            <p>此擴充功能未經過安全性審查，可能存在以下風險：</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>可能包含不安全的程式碼</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>可能影響軟體穩定性</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>使用此擴充功能需自行承擔風險</span>
              </div>
            </div>

            <div className={`
              text-sm text-gray-500
              dark:text-gray-400
            `}
            >
              <p>建議使用經過官方認證的擴充功能以確保安全性。</p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default UnsafePluginWarning;
