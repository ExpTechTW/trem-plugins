'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Moon,
  Sun,
  RefreshCw,
  AlertCircle,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import PluginCard from '@/components/plugin_card';
import type { Plugin } from '@/modal/plugin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [filteredPlugins, setFilteredPlugins] = useState<Plugin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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
          setFilteredPlugins(parsedPlugins);
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          'https://raw.githubusercontent.com/ExpTechTW/trem-plugins/refs/heads/main/data/repository_stats.json',
        );

        const pluginsData = (await response.json()) as Plugin[];

        if (pluginsData.length === 0) {
          throw new Error('無法載入擴充數據');
        }

        localStorage.setItem('tremPlugins', JSON.stringify(pluginsData));
        localStorage.setItem('lastPluginsFetch', now.toString());

        setPlugins(pluginsData);
        setFilteredPlugins(pluginsData);
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
            setFilteredPlugins(parsed);
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

  const filterPlugins = useCallback(
    (term: string) => {
      const filtered = plugins.filter((plugin) => {
        if (!plugin) return false;

        const searchFields: string[] = [];

        if (typeof plugin.name === 'string') {
          searchFields.push(plugin.name.toLowerCase());
        }

        if (plugin.description?.zh_tw && typeof plugin.description.zh_tw === 'string') {
          searchFields.push(plugin.description.zh_tw.toLowerCase());
        }

        if (Array.isArray(plugin.author)) {
          searchFields.push(...plugin.author
            .filter((author): author is string => typeof author === 'string')
            .map((author) => author.toLowerCase()),
          );
        }

        const searchTerms = term.toLowerCase().split(' ').filter(Boolean);

        return searchTerms.every((searchTerm) =>
          searchFields.some((field) => field.includes(searchTerm)),
        );
      });

      const sortedPlugins = [...filtered].sort((a, b) => {
        const downloadsA = Number(a?.repository?.releases?.total_downloads) || 0;
        const downloadsB = Number(b?.repository?.releases?.total_downloads) || 0;
        return sortOrder === 'asc'
          ? downloadsA - downloadsB
          : downloadsB - downloadsA;
      });

      setFilteredPlugins(sortedPlugins);
    },
    [plugins, sortOrder],
  );

  useEffect(() => {
    void fetchPlugins();
  }, [fetchPlugins]);

  useEffect(() => {
    filterPlugins(searchTerm);
  }, [filterPlugins, searchTerm]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    filterPlugins(term);
  };

  const stats = {
    totalPlugins: plugins.length,
    totalDownloads: plugins.reduce((sum, plugin) => {
      return sum + (plugin.repository?.releases?.total_downloads || 0);
    }, 0),
    totalAuthors: new Set(plugins.flatMap((p) => p.author)).size,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <div className="text-lg">載入中...</div>
        </div>
      </div>
    );
  }

  if (error && !plugins.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="max-w-md w-full mx-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold">{error}</h2>
            <Button
              onClick={() => void fetchPlugins()}
              variant="default"
            >
              重試
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
            <p className="text-yellow-700 dark:text-yellow-200">{error}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">TREM 擴充商店</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDarkModeToggle}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜尋擴充... (支援多關鍵字搜尋，用空格分隔)"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-ring focus:border-ring"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            filterPlugins(searchTerm);
          }}
          className="flex items-center gap-2"
        >
          {sortOrder === 'asc' ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
          下載量
          {sortOrder === 'asc' ? '升序' : '降序'}
        </Button>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredPlugins.map((plugin) => (
          <PluginCard key={plugin.name} plugin={plugin} />
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            沒有找到符合條件的擴充
          </p>
        </div>
      )}

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
