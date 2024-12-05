'use client';

import React from 'react';

import AnimatedCounter from '@/lib/counter';
import { formatNumber } from '@/lib/utils';
import { usePluginStore } from '@/stores/plugins';

export interface StatsProps {
  stats: {
    totalPlugins: number;
    totalDownloads: number;
    totalAuthors: number;
  };
}

export default function StatsSection() {
  const pluginStore = usePluginStore();

  return (
    <div className={`
      grid grid-cols-1 gap-4 pt-8
      md:grid-cols-3
    `}
    >
      <AnimatedCounter
        end={pluginStore.plugins.length}
        title="擴充總數"
        formatter={(value: number) => value.toString()}
      />
      <AnimatedCounter
        end={pluginStore.getTotalDownloads()}
        title="總下載量"
        formatter={formatNumber}
      />
      <AnimatedCounter
        end={pluginStore.getTotalAuthors()}
        title="開發人數"
        formatter={(value: number) => value.toString()}
      />
    </div>
  );
}
