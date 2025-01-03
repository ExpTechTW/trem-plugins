'use client';

import { ArrowDownNarrowWide, ArrowUpNarrowWide, Clock, Download, Search, Text } from 'lucide-react';
import { Glow, GlowCapture } from '@codaworks/react-glow';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import PluginCard from '@/components/plugin_card';
import { usePluginStore } from '@/stores/plugins';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';

type SortField = 'name' | 'updated' | 'downloads';
type SortDirection = 'asc' | 'desc';

export default function PluginList() {
  const plugins = usePluginStore((state) => state.plugins);

  const [sortField, setSortField] = useState<SortField>('downloads');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlugins = plugins.filter((plugin) => {
    if (!plugin) return false;

    const searchFields: string[] = [];

    searchFields.push(plugin.name.toLowerCase());
    searchFields.push(plugin.description.zh_tw.toLowerCase());

    searchFields.push(
      ...plugin.author.map((author) => author.toLowerCase()),
    );

    const searchTerms = searchTerm.toLowerCase().split(' ').filter(Boolean);

    return searchTerms.length === 0 || searchTerms.every((term) =>
      searchFields.some((field) => field.includes(term)),
    );
  });

  const sortedPlugins = [...filteredPlugins].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;

    switch (sortField) {
      case 'name':
        return direction * a.name.localeCompare(b.name);

      case 'updated': {
        const aDate = b.repository.releases.releases[0]?.published_at
          ? new Date(b.repository.releases.releases[0].published_at).getTime()
          : -Infinity;
        const bDate = a.repository.releases.releases[0]?.published_at
          ? new Date(a.repository.releases.releases[0].published_at).getTime()
          : -Infinity;
        return direction * (aDate - bDate);
      }

      case 'downloads':
        return direction * (
          a.repository.releases.total_downloads - b.repository.releases.total_downloads
        );

      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className={`
        flex flex-col items-center gap-4
        md:flex-row
      `}
      >
        <Search className="text-muted-foreground" />

        <Input
          type="text"
          placeholder="搜尋擴充... (支援多關鍵字搜尋，用空格分隔)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <Select value={sortField} onValueChange={(v: SortField) => setSortField(v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="downloads">
                <div className="flex items-center gap-2">
                  <Download size={18} />
                  <span>下載次數</span>
                </div>
              </SelectItem>
              <SelectItem value="updated">
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>最後更新</span>
                </div>
              </SelectItem>
              <SelectItem value="name">
                <div className="flex items-center gap-2">
                  <Text size={18} />
                  <span>名稱</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortDirection(sortDirection == 'asc' ? 'desc' : 'asc')}
          >
            {sortDirection == 'asc' ? <ArrowDownNarrowWide /> : <ArrowUpNarrowWide />}
          </Button>
        </div>
      </div>

      {/* 擴充列表 */}
      <GlowCapture>
        <div className={`
          grid grid-cols-1 gap-4
          lg:grid-cols-3
          sm:grid-cols-2
        `}
        >
          {sortedPlugins.map((plugin) => (
            <Glow key={plugin.name}>
              <PluginCard plugin={plugin} />
            </Glow>
          ))}
        </div>
      </GlowCapture>

      {sortedPlugins.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-xl text-muted-foreground">
            沒有找到符合條件的擴充
          </p>
        </div>
      )}
    </div>
  );
}
