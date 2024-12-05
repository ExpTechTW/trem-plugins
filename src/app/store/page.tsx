'use client';

import { AlertCircle, Loader2Icon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import NavigationHeader from '@/components/navigation-header';
import AppFooter from '@/components/footer';
import PluginList from '@/components/plugin_list';
import TrafficChart from '@/components/traffic_chart';
import { formatTimeString } from '@/lib/utils';
import StatsSection from '@/components/status';

import type { Plugin } from '@/modal/plugin';

export default function StorePage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateTime, setUpdateTime] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('lastPluginsFetch') ?? 0);
    }
    return Date.now();
  });
  const [error, setError] = useState<string | null>(null);
  const maxRetries = 3;

  const fetchPlugins = useCallback(
    async (retry = 0) => {
      try {
        setError(null);
        const cachedPlugins = localStorage.getItem('tremPlugins');
        const lastFetch = localStorage.getItem('lastPluginsFetch');
        const now = Date.now();

        if (cachedPlugins && lastFetch && now - parseInt(lastFetch) < 300000) {
          const parsedPlugins = JSON.parse(cachedPlugins) as Plugin[];
          setPlugins(Array.isArray(parsedPlugins) ? parsedPlugins : []);
          setUpdateTime(now);
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          'https://raw.githack.com/ExpTechTW/trem-plugins/refs/heads/main/data/repository_stats.json',
        );

        const pluginsData = (await response.json()) as Plugin[];

        if (!Array.isArray(pluginsData) || pluginsData.length === 0) {
          throw new Error('無法載入擴充數據');
        }

        localStorage.setItem('tremPlugins', JSON.stringify(pluginsData));
        localStorage.setItem('lastPluginsFetch', now.toString());

        setPlugins(pluginsData);
        setUpdateTime(now);
        setIsLoading(false);
      }
      catch (error) {
        console.error('Error:', error);

        if (retry < maxRetries) {
          setError(`載入失敗 (${retry + 1}/${maxRetries})，重試中...`);
          setTimeout(() => {
            void fetchPlugins(retry + 1);
          }, 1000 * (retry + 1));
        }
        else {
          const cachedData = localStorage.getItem('tremPlugins');
          if (cachedData) {
            try {
              const parsed = JSON.parse(cachedData) as Plugin[];
              setPlugins(Array.isArray(parsed) ? parsed : []);
              setError('使用緩存資料（可能不是最新）');
            }
            catch {
              setPlugins([]);
              setError('緩存資料損壞');
            }
          }
          else {
            setError('無法載入擴充資料，請重新整理頁面');
          }
        }
        setIsLoading(false);
      }
    },
    [maxRetries],
  );

  useEffect(() => {
    void fetchPlugins();
  }, [fetchPlugins]);

  const stats = {
    totalPlugins: Array.isArray(plugins) ? plugins.length : 0,
    totalDownloads: Array.isArray(plugins)
      ? plugins.reduce((sum, plugin) => {
        return sum + (plugin.repository?.releases?.total_downloads || 0);
      }, 0)
      : 0,
    totalAuthors: Array.isArray(plugins)
      ? new Set(plugins.flatMap((p) => p.author)).size
      : 0,
  };

  if (isLoading) {
    return (
      <div className="grid h-svh w-svw items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2Icon className="animate-spin" />
          <div className="text-lg">載入中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid h-svh w-svw items-center justify-center">
        <div className="flex items-center gap-2">
          <div>{error}</div>
          <Button
            onClick={() => void fetchPlugins()}
            variant="default"
          >
            重試
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavigationHeader />
      <div className="flex flex-col gap-4">
        <main className="container mx-auto min-h-svh flex-1 px-4 py-8">
          {error && (
            <div className={`
              mb-4 border-l-4 border-yellow-500 bg-yellow-100 p-4
              dark:bg-yellow-900
            `}
            >
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
                <p className={`
                  text-yellow-700
                  dark:text-yellow-200
                `}
                >
                  {error}
                </p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold">TREM 擴充商店</h1>
          </div>

          <PluginList plugins={plugins} />
          <StatsSection stats={stats} />
          <div className="pt-8">
            <TrafficChart />
          </div>
        </main>

        <AppFooter>
          <div className={`
            flex flex-col justify-between gap-2
            md:flex-row
          `}
          >
            <div>&copy; 2024 ExpTech Ltd.</div>
            所有數據更新於
            {' '}
            {formatTimeString(updateTime)}
          </div>
        </AppFooter>
      </div>
    </div>
  );
}
