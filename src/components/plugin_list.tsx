'use client';

import { GlowCapture, Glow } from '@codaworks/react-glow';
import { ArrowUp, ArrowDown, Search, Download, Clock, Text, ArrowDownNarrowWide, ArrowUpWideNarrow, ArrowUpNarrowWide, ArrowDownWideNarrow } from 'lucide-react';
import { useState } from 'react';

import PluginCard from '@/components/plugin_card';
import { Button } from '@/components/ui/button';

import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

import type { Plugin } from '@/modal/plugin';

type SortField = 'name' | 'updated' | 'downloads';
type SortDirection = 'asc' | 'desc';

export default function PluginList({ plugins: initialPlugins }: { plugins: Plugin[] }) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // 先過濾再排序
  const filteredPlugins = initialPlugins.filter((plugin) => {
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
              <SelectItem value="name">
                <div className="flex items-center gap-2">
                  <Text size={18} />
                  <span>名稱</span>
                </div>
              </SelectItem>
              <SelectItem value="update">
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>最後更新</span>
                </div>
              </SelectItem>
              <SelectItem value="downloads">
                <div className="flex items-center gap-2">
                  <Download size={18} />
                  <span>下載次數</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortDirection(sortDirection == 'asc' ? 'desc' : 'asc')}
          >
            {sortDirection == 'asc' ? <ArrowUpNarrowWide /> : <ArrowDownWideNarrow />}
          </Button>
        </div>
      </div>

      {/* 插件列表 */}
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
