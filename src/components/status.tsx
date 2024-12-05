'use client';

import React from 'react';

import { formatNumber } from '@/lib/utils';
import AnimatedCounter from '@/lib/counter';

export interface StatsProps {
  stats: {
    totalPlugins: number;
    totalDownloads: number;
    totalAuthors: number;
  };
}

const StatsSection: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className={`
      grid grid-cols-1 gap-4 pt-8
      md:grid-cols-3
    `}
    >
      <AnimatedCounter
        end={stats.totalPlugins}
        title="擴充總數"
        formatter={(value: number) => value.toString()}
      />
      <AnimatedCounter
        end={stats.totalDownloads}
        title="總下載量"
        formatter={formatNumber}
      />
      <AnimatedCounter
        end={stats.totalAuthors}
        title="開發人數"
        formatter={(value: number) => value.toString()}
      />
    </div>
  );
};

export default StatsSection;
