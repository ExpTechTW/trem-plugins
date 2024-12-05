'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plugin } from '@/modal/plugin';

interface DayActivity {
  date: string;
  count: number;
  color: string;
}

export default function ActivityHeatmap({ plugin }: { plugin: Plugin }) {
  const activityData = useMemo(() => {
    const releases = plugin.repository.releases.releases;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1);

    const activityMap = new Map<string, number>();

    const current = new Date(startDate);
    const data: DayActivity[] = [];

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      activityMap.set(dateStr, 0);
      current.setDate(current.getDate() + 1);
    }

    releases.forEach((release) => {
      const date = new Date(release.published_at);
      if (date >= startDate && date <= endDate) {
        const dateStr = date.toISOString().split('T')[0];
        activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
      }
    });

    const maxActivity = Math.max(...Array.from(activityMap.values()));
    activityMap.forEach((count, date) => {
      let color = '#ebedf0';
      if (count > 0) {
        const intensity = count / maxActivity;
        if (intensity < 0.25) color = '#9be9a8';
        else if (intensity < 0.5) color = '#40c463';
        else if (intensity < 0.75) color = '#30a14e';
        else color = '#216e39';
      }
      data.push({ date, count, color });
    });

    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [plugin]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">發布活躍度（最近一個月）</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex flex-row flex-wrap gap-1">
            {activityData.map((day) => (
              <Tooltip key={day.date}>
                <TooltipTrigger>
                  <div
                    className="h-3 w-3 rounded-sm transition-colors"
                    style={{ backgroundColor: day.color }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {formatDate(day.date)}
                    :
                    {' '}
                    {day.count}
                    {' '}
                    個版本
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
        <div className={`
          mt-2 flex items-center gap-2 text-xs text-muted-foreground
        `}
        >
          <span>少</span>
          <div className="flex gap-0.5">
            <div className="h-3 w-3 rounded-sm bg-[#ebedf0]" />
            <div className="h-3 w-3 rounded-sm bg-[#9be9a8]" />
            <div className="h-3 w-3 rounded-sm bg-[#40c463]" />
            <div className="h-3 w-3 rounded-sm bg-[#30a14e]" />
            <div className="h-3 w-3 rounded-sm bg-[#216e39]" />
          </div>
          <span>多</span>
        </div>
      </CardContent>
    </Card>
  );
}
