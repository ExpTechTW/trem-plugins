import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';

import Plugin from '@/modal/plugin';
import { PluginDataRepoUrl } from '@/lib/constants';

const PluginList = z.array(Plugin);
type PluginList = z.infer<typeof PluginList>;

interface PluginStore {
  plugins: PluginList;
  lastUpdateTime: number;
  setPlugins(plugins: PluginList): void;
  fetch(): Promise<void>;
  getTotalDownloads(): number;
  getTotalAuthors(): number;
}

export const usePluginStore = create(
  persist<PluginStore>(
    (set, get) => ({
      plugins: [],
      lastUpdateTime: 0,
      setPlugins(plugins: PluginList) {
        set({
          plugins: PluginList.parse(plugins),
        });
      },
      async fetch() {
        let cachedPlugins = localStorage.getItem('tremPlugins') ?? '';
        const lastFetch = Number(localStorage.getItem('lastPluginsFetch') ?? 0);

        const now = Date.now();

        if (!cachedPlugins || now - lastFetch > 300_000) {
          const response = await fetch(PluginDataRepoUrl);

          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}: ${await response.text()}`);
          }

          cachedPlugins = JSON.stringify(await response.json() as Promise<object>);

          localStorage.setItem('tremPlugins', cachedPlugins);
          localStorage.setItem('lastPluginsFetch', now.toString());
        }

        set({
          plugins: PluginList.parse(JSON.parse(cachedPlugins)),
          lastUpdateTime: Date.now(),
        });
      },
      getTotalDownloads() {
        return get().plugins.reduce((sum, plugin) => {
          return sum + (plugin.repository.releases.total_downloads);
        }, 0);
      },
      getTotalAuthors() {
        return new Set(
          get().plugins.flatMap((p) => p.author),
        ).size;
      },
    }),
    {
      name: 'plugins',
    },
  ),
);
