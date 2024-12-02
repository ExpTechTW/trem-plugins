'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  Download,
  GitFork,
  Tag,
  Search,
  SortAsc,
  Grid,
  List,
  Moon,
  Sun,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

interface Release {
  tag_name: string
  name: string
  downloads: number
  published_at: string
}

interface Repository {
  full_name: string
  releases: {
    total_count: number
    total_downloads: number
    releases: Release[]
  }
}

interface Plugin {
  name: string
  version: string
  description: {
    zh_tw: string
  }
  author: string[]
  dependencies: {
    [key: string]: string
  }
  link: string
  status: 'stable' | 'rc' | 'pre'
  repository: Repository
  updated_at: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'stable': return 'bg-green-500'
    case 'rc': return 'bg-yellow-500'
    case 'pre': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'stable': return '穩定版'
    case 'rc': return '發布候選'
    case 'pre': return '預覽版'
    default: return status
  }
}

export default function Home() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [filteredPlugins, setFilteredPlugins] = useState<Plugin[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showStable, setShowStable] = useState(true)
  const [showRc, setShowRc] = useState(true)
  const [showPre, setShowPre] = useState(true)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [error, setError] = useState<string | null>(null)
  const maxRetries = 3

  const fetchPlugins = useCallback(async (retry = 0) => {
    try {
      setError(null)
      const cachedPlugins = localStorage.getItem('tremPlugins')
      const lastFetch = localStorage.getItem('lastPluginsFetch')
      const now = Date.now()
      
      if (cachedPlugins && lastFetch && (now - parseInt(lastFetch)) < 3600000) {
        const parsedPlugins = JSON.parse(cachedPlugins)
        setPlugins(parsedPlugins)
        setFilteredPlugins(parsedPlugins)
        setIsLoading(false)
        return
      }

      const response = await axios.get<Plugin[]>(
        'https://raw.githubusercontent.com/ExpTechTW/trem-plugins/refs/heads/main/data/repository_stats.json'
      )

      const pluginsData = response.data

      if (pluginsData.length === 0) {
        throw new Error('無法載入插件數據')
      }

      localStorage.setItem('tremPlugins', JSON.stringify(pluginsData))
      localStorage.setItem('lastPluginsFetch', now.toString())

      setPlugins(pluginsData)
      setFilteredPlugins(pluginsData)
      setIsLoading(false)

    } catch (error) {
      console.error('Error:', error)
      
      if (retry < maxRetries) {
        setError(`載入失敗 (${retry + 1}/${maxRetries})，重試中...`)
        setTimeout(() => {
          void fetchPlugins(retry + 1)
        }, 1000 * (retry + 1))
      } else {
        const cachedData = localStorage.getItem('tremPlugins')
        if (cachedData) {
          const parsed = JSON.parse(cachedData)
          setPlugins(parsed)
          setFilteredPlugins(parsed)
          setError('使用緩存資料（可能不是最新）')
        } else {
          setError('無法載入插件資料，請重新整理頁面')
        }
      }
      setIsLoading(false)
    }
  }, [maxRetries])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  useEffect(() => {
    void fetchPlugins()
  }, [fetchPlugins])

  const filterPlugins = useCallback((term: string) => {
    let filtered = plugins.filter(plugin => 
      (plugin.name.toLowerCase().includes(term) ||
       plugin.description.zh_tw.toLowerCase().includes(term) ||
       plugin.author.some(author => author.toLowerCase().includes(term))) &&
      ((showStable && plugin.status === 'stable') ||
       (showRc && plugin.status === 'rc') ||
       (showPre && plugin.status === 'pre'))
    )

    filtered = [...filtered].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name)
      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredPlugins(filtered)
  }, [plugins, showStable, showRc, showPre, sortOrder])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase()
    setSearchTerm(term)
    filterPlugins(term)
  }

  const handleDownload = (plugin: Plugin, version: string) => {
    const filename = `${plugin.name}.trem`
    const downloadUrl = `https://github.com/${plugin.repository.full_name}/releases/download/${version}/${filename}`
    window.open(downloadUrl, '_blank')
  }

  const [selectedVersions, setSelectedVersions] = useState<Record<string, string>>({})

  const handleVersionChange = (plugin: Plugin, version: string) => {
    setSelectedVersions(prev => ({
      ...prev,
      [plugin.name]: version
    }))
  }

  const stats = {
    totalPlugins: plugins.length,
    totalDownloads: plugins.reduce((sum, plugin) => {
      if (!plugin.repository?.releases?.total_downloads) {
        return sum
      }
      return sum + plugin.repository.releases.total_downloads
    }, 0),
    totalAuthors: new Set(plugins.flatMap(p => p.author)).size,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <div className="text-lg">載入中...</div>
        </div>
      </div>
    )
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
    )
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">TREM 插件</h1>
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

        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowStable(!showStable)
              filterPlugins(searchTerm)
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showStable 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            穩定版
          </button>
          <button
            onClick={() => {
              setShowRc(!showRc)
              filterPlugins(searchTerm)
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showRc 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            發布候選
          </button>
          <button
            onClick={() => {
              setShowPre(!showPre)
              filterPlugins(searchTerm)
            }}
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
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
            filterPlugins(searchTerm)
          }}
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
        {filteredPlugins.map(plugin => {
  const releases = plugin.repository?.releases?.releases || []
  const selectedVersion = selectedVersions[plugin.name] || (releases[0]?.tag_name ?? '')
  
  return (
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
            {getStatusText(plugin.status)}
          </span>
        </div>

        <p className="mb-4 text-gray-600 dark:text-gray-300">{plugin.description.zh_tw}</p>
        
        <div className="space-y-2 mb-4">
          <p className="text-sm flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <GitFork className="h-4 w-4" />
            {plugin.author.join(', ')}
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

        <div className="flex flex-col gap-4">
          <button
            onClick={() => window.open(plugin.link, '_blank')}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <GitFork className="h-4 w-4" />
            查看源碼
          </button>

          {releases.length > 0 ? (
            <div className="flex gap-2">
              <select
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                value={selectedVersion}
                onChange={(e) => handleVersionChange(plugin, e.target.value)}
              >
                {releases.map(release => (
                  <option key={release.tag_name} value={release.tag_name}>
                    {release.tag_name} ({new Date(release.published_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleDownload(plugin, selectedVersion)}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                下載
              </button>
            </div>
          ) : (
            <div className="w-full px-4 py-2 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg">
              暫無可用版本
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Tag className="h-4 w-4" />
            <span>可用版本: {releases.length}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
            <Download className="h-4 w-4" />
            <span>總下載次數: {plugin.repository?.releases?.total_downloads || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
})}
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
  )
}