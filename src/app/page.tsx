'use client';

import { Moon, Sun, AlertCircle, Loader2Icon } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import PluginList from '@/components/plugin_list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

import type { Plugin } from '@/modal/plugin';

export default function Home() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
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

        if (cachedPlugins && lastFetch && now - parseInt(lastFetch) < 600000) {
          const parsedPlugins = JSON.parse(cachedPlugins) as Plugin[];
          setPlugins(parsedPlugins);
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          'https://raw.githack.com/ExpTechTW/trem-plugins/refs/heads/main/data/repository_stats.json',
        );

        const pluginsData = (await response.json()) as Plugin[];

        if (pluginsData.length === 0) {
          throw new Error('無法載入擴充數據');
        }

        localStorage.setItem('tremPlugins', JSON.stringify(pluginsData));
        localStorage.setItem('lastPluginsFetch', now.toString());

        setPlugins(pluginsData);
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
            const parsed = JSON.parse(cachedData) as Plugin[];
            setPlugins(parsed);
            setError('使用緩存資料（可能不是最新）');
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

  const handleDarkModeToggle = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem('darkMode', String(newValue));
      document.documentElement.classList.toggle('dark', newValue);
      return newValue;
    });
  };

  useEffect(() => {
    void fetchPlugins();
  }, [fetchPlugins]);

  const stats = {
    totalPlugins: plugins.length,
    totalDownloads: plugins.reduce((sum, plugin) => {
      return sum + (plugin.repository?.releases?.total_downloads || 0);
    }, 0),
    totalAuthors: new Set(plugins.flatMap((p) => p.author)).size,
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
    <main className="container mx-auto px-4 py-8">
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

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">TREM 擴充商店</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDarkModeToggle}
          >
            {isDarkMode
              ? <Sun className="h-5 w-5" />
              : (
                  <Moon className="h-5 w-5" />
                )}
          </Button>
        </div>
      </div>

      <div className={`
        mb-8 grid grid-cols-1 gap-4
        md:grid-cols-3
      `}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">擴充總數</CardTitle>
            <CardContent className="p-0 pt-2">
              <span className="text-3xl font-bold">{stats.totalPlugins}</span>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">總下載量</CardTitle>
            <CardContent className="p-0 pt-2">
              <span className="text-3xl font-bold">{formatNumber(stats.totalDownloads)}</span>
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">開發者數量</CardTitle>
            <CardContent className="p-0 pt-2">
              <span className="text-3xl font-bold">{stats.totalAuthors}</span>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
      <PluginList plugins={plugins} />

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          © 2024 TREM Plugins. 所有數據更新於
          {' '}
          {new Date().toLocaleDateString()}
        </p>
      </footer>
    </main>
  );
}
