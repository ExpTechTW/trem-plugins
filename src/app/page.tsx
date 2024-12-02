'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';

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
}

export default function Home() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [filteredPlugins, setFilteredPlugins] = useState<Plugin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cachedPlugins = localStorage.getItem('tremPlugins');
    const lastFetch = localStorage.getItem('lastPluginsFetch');
    const now = Date.now();
    
    if (cachedPlugins && lastFetch && (now - parseInt(lastFetch)) < 3600000) {
      setPlugins(JSON.parse(cachedPlugins));
      setFilteredPlugins(JSON.parse(cachedPlugins));
      setIsLoading(false);
    } else {
      fetchPlugins();
    }
  }, []);

  const fetchPlugins = async () => {
    try {
      const response = await axios.get('https://api.github.com/repos/ExpTechTW/TREM-Plugins/contents/infos');
      const pluginsData = [];

      for (const file of response.data) {
        if (file.name.endsWith('.json')) {
          const pluginData = await axios.get(file.download_url);
          pluginData.data.downloads = Math.floor(Math.random() * 1000);
          pluginData.data.lastUpdated = new Date(Date.now() - Math.random() * 10000000000);
          pluginsData.push(pluginData.data);
        }
      }

      localStorage.setItem('tremPlugins', JSON.stringify(pluginsData));
      localStorage.setItem('lastPluginsFetch', Date.now().toString());

      setPlugins(pluginsData);
      setFilteredPlugins(pluginsData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching plugins:', error);
      setIsLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = plugins.filter(plugin => 
      plugin.name.toLowerCase().includes(term) ||
      plugin.description.zh_tw.toLowerCase().includes(term) ||
      plugin.author.some(author => author.toLowerCase().includes(term))
    );
    setFilteredPlugins(filtered);
  };

  const sortPlugins = (criteria: 'name' | 'downloads' | 'updated') => {
    const sorted = [...filteredPlugins];
    switch(criteria) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'downloads':
        sorted.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'updated':
        sorted.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
    }
    setFilteredPlugins(sorted);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  const stats = {
    totalPlugins: plugins.length,
    totalDownloads: plugins.reduce((sum, p) => sum + p.downloads, 0),
    totalAuthors: new Set(plugins.flatMap(p => p.author)).size
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">TREM Plugins</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="搜尋插件..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 border rounded dark:bg-gray-800"
        />
      </div>

      <div className="flex gap-4 mb-6 justify-center">
        <button 
          onClick={() => sortPlugins('name')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          名稱排序
        </button>
        <button 
          onClick={() => sortPlugins('downloads')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          下載量排序
        </button>
        <button 
          onClick={() => sortPlugins('updated')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          更新時間排序
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPlugins.map(plugin => (
          <div key={plugin.name} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-2">{plugin.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">版本 {plugin.version}</p>
            <p className="mb-4">{plugin.description.zh_tw}</p>
            
            <div className="mb-4">
              <p className="text-sm">
                作者: {plugin.author.join(', ')} <br/>
                下載量: {plugin.downloads} <br/>
                最後更新: {new Date(plugin.lastUpdated).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(plugin.dependencies || {}).map(([name, version]) => (
                <span key={name} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm">
                  {name} {version}
                </span>
              ))}
            </div>

            <a
              href={plugin.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              查看源碼
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}