import React from 'react';

import { formatTimeString } from '@/lib/utils';
import { usePluginStore } from '@/stores/plugins';

export default function AppFooter() {
  const lastUpdateTime = usePluginStore((state) => state.lastUpdateTime);

  return (
    <footer className={`
      border-t border-muted px-8 py-8 text-muted-foreground
      md:px-16
      xl:px-24
    `}
    >
      <div className={`
        flex flex-col justify-between gap-2
        md:flex-row
      `}
      >
        <div>&copy; 2024 ExpTech Ltd.</div>
        {lastUpdateTime != 0 && (
          <div>
            所有數據更新於
            {' '}
            {formatTimeString(lastUpdateTime)}
          </div>
        )}
      </div>
    </footer>
  );
}
