'use client';

import { useState, useEffect, useCallback } from 'react';

import {
  Search,
  SortAsc,
  Grid,
  List,
  Moon,
  Sun,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import PluginCard from '@/components/plugin_card';
import type { Plugin } from '@/modal/plugin';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Home() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [filteredPlugins, setFilteredPlugins] = useState<Plugin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showStable, setShowStable] = useState(true);
  const [showRc, setShowRc] = useState(false);
  const [showPre, setShowPre] = useState(false);
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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    void fetchPlugins();
  }, [fetchPlugins]);

  const handleStableToggle = () => {
    setShowStable((prev) => !prev);
  };

  const handleRcToggle = () => {
    setShowRc((prev) => !prev);
  };

  const handlePreToggle = () => {
    setShowPre((prev) => !prev);
  };

  const filterPlugins = useCallback(
    (term: string) => {
      let filtered = plugins.filter(
        (plugin) =>
          (plugin.name.toLowerCase().includes(term.toLowerCase())
            || plugin.description.zh_tw
              .toLowerCase()
              .includes(term.toLowerCase())
              || plugin.author.some((author) =>
                author.toLowerCase().includes(term.toLowerCase()),
              ))
              && ((showStable && !plugin.version.includes('-'))
                || (showRc && plugin.version.includes('rc'))
                || (showPre && plugin.version.includes('pre'))),
      );

      filtered = [...filtered].sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? comparison : -comparison;
      });

      setFilteredPlugins(filtered);
    },
    [plugins, showStable, showRc, showPre, sortOrder],
  );

  useEffect(() => {
    filterPlugins(searchTerm);
  }, [filterPlugins, searchTerm, showStable, showRc, showPre]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    filterPlugins(term);
  };

  const stats = {
    totalPlugins: plugins.length,
    totalDownloads: plugins.reduce((sum, plugin) => {
      if (!plugin.repository?.releases?.total_downloads) {
        return sum;
      }
      return sum + plugin.repository.releases.total_downloads;
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
            <button
              onClick={() => void fetchPlugins()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              重試
            </button>
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
        <h1 className="text-3xl font-bold text-foreground">TREM 擴充</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {viewMode === 'grid'
              ? (
                  <List className="h-5 w-5" />
                )
              : (
                  <Grid className="h-5 w-5" />
                )}
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {isDarkMode
              ? (
                  <Sun className="h-5 w-5" />
                )
              : (
                  <Moon className="h-5 w-5" />
                )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">擴充總數</CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{stats.totalPlugins}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">總下載量</CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{stats.totalDownloads}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">開發者數量</CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{stats.totalAuthors}</span>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋擴充..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleStableToggle}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showStable
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            穩定版
          </button>

          <button
            onClick={handleRcToggle}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showRc
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            發布候選
          </button>

          <button
            onClick={handlePreToggle}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showPre
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            預覽版
          </button>
        </div>

        <button
          onClick={() => {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            filterPlugins(searchTerm);
          }}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <SortAsc className="h-5 w-5" />
          {sortOrder === 'asc' ? '升序' : '降序'}
        </button>
      </div>

      <div
        className={`${
          viewMode === 'grid'
            ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
            : 'flex flex-col gap-4'
        }`}
      >
        {filteredPlugins.map((plugin) => (
          <PluginCard key={plugin.name} plugin={plugin} />
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 dark:text-gray-400">
            沒有找到符合條件的擴充
          </p>
        </div>
      )}

      <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          © 2024 TREM Plugins. 所有數據更新於
          {' '}
          {new Date().toLocaleDateString()}
        </p>
      </footer>
    </main>
  );
}
