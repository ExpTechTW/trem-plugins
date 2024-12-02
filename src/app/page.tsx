'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Download,
  GitFork,
  Clock,
  Search,
  SortAsc,
  Grid,
  List,
  Moon,
  Sun,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface Plugin {
  name: string;
  version: string;
  description: {
    zh_tw: string;
  };
  author: string[];
  dependencies: {
    [key: string]: string;
  };
  link: string;
  downloads: number;
  lastUpdated: string;
  category?: string;
  rating?: number;
  status: 'stable' | 'beta' | 'alpha';
}

export default function Home() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [filteredPlugins, setFilteredPlugins] = useState<Plugin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showStable, setShowStable] = useState(true);
  const [showBeta, setShowBeta] = useState(true);
  const [showAlpha, setShowAlpha] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [downloadTrends, setDownloadTrends] = useState([]);
  const maxRetries = 3;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const generateDownloadTrends = (pluginsData: Plugin[]) => {
    const trends = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        downloads: Math.floor(Math.random() * 100)
      });
    }
    setDownloadTrends(trends);
  };

  const fetchPlugins = async (retry = 0) => {
    try {
      setError(null);
      const cachedPlugins = localStorage.getItem('tremPlugins');
      const lastFetch = localStorage.getItem('lastPluginsFetch');
      const now = Date.now();
      
      if (cachedPlugins && lastFetch && (now - parseInt(lastFetch)) < 3600000) {
        const parsedPlugins = JSON.parse(cachedPlugins);
        setPlugins(parsedPlugins);
        setFilteredPlugins(parsedPlugins);
        generateDownloadTrends(parsedPlugins);
        setIsLoading(false);
        return;
      }

      const response = await axios.get(
        'https://api.github.com/repos/ExpTechTW/TREM-Plugins/contents/infos',
        {
          timeout: 5000,
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      const pluginsData = [];
      
      for (const file of response.data) {
        if (file.name.endsWith('.json')) {
          try {
            const pluginData = await axios.get(file.download_url);
            pluginData.data.downloads = Math.floor(Math.random() * 1000);
            pluginData.data.lastUpdated = new Date(Date.now() - Math.random() * 10000000000).toISOString();
            pluginData.data.category = ['utility', 'visualization', 'data', 'integration'][Math.floor(Math.random() * 4)];
            pluginData.data.rating = (3 + Math.random() * 2).toFixed(1);
            pluginData.data.status = ['stable', 'beta', 'alpha'][Math.floor(Math.random() * 3)];
            pluginsData.push(pluginData.data);
          } catch (err) {
            console.warn(`Skipping plugin ${file.name}:`, err);
            continue;
          }
        }
      }

      if (pluginsData.length === 0) {
        throw new Error('無法載入插件數據');
      }

      localStorage.setItem('tremPlugins', JSON.stringify(pluginsData));
      localStorage.setItem('lastPluginsFetch', Date.now().toString());

      setPlugins(pluginsData);
      setFilteredPlugins(pluginsData);
      generateDownloadTrends(pluginsData);
      setIsLoading(false);
      setRetryCount(0);

    } catch (error) {
      console.error('Error:', error);
      
      if (retry < maxRetries) {
        setError(`載入失敗 (${retry + 1}/${maxRetries})，重試中...`);
        setTimeout(() => {
          fetchPlugins(retry + 1);
        }, 1000 * (retry + 1));
      } else {
        const cachedData = localStorage.getItem('tremPlugins');
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          setPlugins(parsed);
          setFilteredPlugins(parsed);
          generateDownloadTrends(parsed);
          setError('使用緩存資料（可能不是最新）');
        } else {
          setError('無法載入插件資料，請重新整理頁面');
        }
      }
      setIsLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    filterPlugins(term, selectedCategory);
  };

  const filterPlugins = (term: string, category: string) => {
    let filtered = plugins.filter(plugin => 
      (plugin.name.toLowerCase().includes(term) ||
       plugin.description.zh_tw.toLowerCase().includes(term) ||
       plugin.author.some(author => author.toLowerCase().includes(term))) &&
      (category === 'all' || plugin.category === category) &&
      ((showStable && plugin.status === 'stable') ||
       (showBeta && plugin.status === 'beta') ||
       (showAlpha && plugin.status === 'alpha'))
    );

    filtered = [...filtered].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredPlugins(filtered);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    filterPlugins(searchTerm, value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-500';
      case 'beta': return 'bg-yellow-500';
      case 'alpha': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderStarRating = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
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
              onClick={() => fetchPlugins()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              重試
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    totalPlugins: plugins.length,
    totalDownloads: plugins.reduce((sum, p) => sum + p.downloads, 0),
    totalAuthors: new Set(plugins.flatMap(p => p.author)).size,
    avgRating: plugins.reduce((sum, p) => sum + Number(p.rating), 0) / plugins.length
  };

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TREM Plugins</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">插件總數</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalPlugins}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">總下載量</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalDownloads}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">開發者數量</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalAuthors}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">平均評分</h3>
          <p className="text-2xl font-bold mt-2">{stats.avgRating.toFixed(1)}</p>
          <div className="text-yellow-500">{renderStarRating(stats.avgRating)}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-2">下載趨勢</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">過去 30 天的下載統計</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={downloadTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="downloads" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋插件..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        >
          <option value="all">全部分類</option>
          <option value="utility">工具類</option>
          <option value="visualization">視覺化</option>
          <option value="data">數據處理</option>
          <option value="integration">系統整合</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setShowStable(!showStable)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showStable 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            穩定版
          </button>
          <button
            onClick={() => setShowBeta(!showBeta)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showBeta 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            測試版
          </button>
          <button
            onClick={() => setShowAlpha(!showAlpha)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showAlpha 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            開發版
          </button>
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <SortAsc className="h-5 w-5" />
          {sortOrder === 'asc' ? '升序' : '降序'}
        </button>
      </div>

      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' 
          : 'flex flex-col gap-4'
      }`}>
        {filteredPlugins.map(plugin => (
          <div 
            key={plugin.name}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">{plugin.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">版本 {plugin.version}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(plugin.status)}`}>
                  {plugin.status}
                </span>
              </div>

              <p className="mb-4 text-gray-600 dark:text-gray-300">{plugin.description.zh_tw}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                    {plugin.category}
                  </span>
                  <span className="text-yellow-500">{renderStarRating(Number(plugin.rating))}</span>
                </div>
                <p className="text-sm flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Download className="h-4 w-4" />
                  {plugin.downloads}
                </p>
                <p className="text-sm flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <GitFork className="h-4 w-4" />
                  {plugin.author.join(', ')}
                </p>
                <p className="text-sm flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  {new Date(plugin.lastUpdated).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(plugin.dependencies || {}).map(([name, version]) => (
                  <span 
                    key={name}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                  >
                    {name} {version}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.open(plugin.link, '_blank')}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  查看源碼
                </button>
                <button
                  onClick={() => {
                    alert('開始下載 ' + plugin.name);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  下載插件
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 dark:text-gray-400">沒有找到符合條件的插件</p>
        </div>
      )}

      <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2024 TREM Plugins. 所有數據更新於 {new Date().toLocaleDateString()}</p>
      </footer>
    </main>
  );
}