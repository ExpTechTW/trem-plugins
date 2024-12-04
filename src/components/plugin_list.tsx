'use client';

import {
  ArrowUp,
  ArrowDown,
  Download,
  Clock,
  Text,
  Search,
} from 'lucide-react';
import { useState } from 'react';

import PluginCard from '@/components/plugin_card';
import { Button } from '@/components/ui/button';
import { type Plugin } from '@/modal/plugin';

type SortField = 'name' | 'updated' | 'downloads';
type SortDirection = 'asc' | 'desc';

interface SortButtonProps {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  label: string;
  icon: React.ReactNode;
  onClick: (field: SortField) => void;
}

const SortButton = ({ field, currentField, direction, label, icon, onClick }: SortButtonProps) => {
  const isActive = field === currentField;

  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      size="sm"
      className="flex items-center gap-2"
      onClick={() => onClick(field)}
    >
      {icon}
      <span>{label}</span>
      {isActive && (direction === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
    </Button>
  );
};

export default function PluginList({ plugins: initialPlugins }: { plugins: Plugin[] }) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    }
    else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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
          b.repository.releases.total_downloads - a.repository.releases.total_downloads
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
        {/* 搜尋框 */}
        <div className="relative w-full flex-1">
          <Search className={`
            absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2
            text-muted-foreground
          `}
          />
          <input
            type="text"
            placeholder="搜尋擴充... (支援多關鍵字搜尋，用空格分隔)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`
              h-9 w-full rounded-lg border bg-background pl-10 pr-4
              focus:border-ring focus:ring-2 focus:ring-ring
            `}
          />
        </div>

        {/* 排序按鈕組 */}
        <div className="flex shrink-0 flex-wrap gap-2">
          <SortButton
            field="name"
            currentField={sortField}
            direction={sortDirection}
            label="名稱"
            icon={<Text size={16} />}
            onClick={handleSort}
          />
          <SortButton
            field="updated"
            currentField={sortField}
            direction={sortDirection}
            label="最後更新"
            icon={<Clock size={16} />}
            onClick={handleSort}
          />
          <SortButton
            field="downloads"
            currentField={sortField}
            direction={sortDirection}
            label="下載量"
            icon={<Download size={16} />}
            onClick={handleSort}
          />
        </div>
      </div>

      {/* 插件列表 */}
      <div className={`
        grid grid-cols-1 gap-4
        lg:grid-cols-3
        sm:grid-cols-2
      `}
      >
        {sortedPlugins.map((plugin) => (
          <PluginCard key={plugin.name} plugin={plugin} />
        ))}
      </div>

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
