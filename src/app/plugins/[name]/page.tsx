import { type Plugin } from '@/modal/plugin';

import PluginPageClient from './client';

async function fetchPlugins(): Promise<Plugin[]> {
  try {
    const response = await fetch(
      'https://raw.githack.com/ExpTechTW/trem-plugins/refs/heads/main/data/repository_stats.json',
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch plugins');
    }

    const pluginsData = await response.json() as Plugin[];

    if (pluginsData.length === 0) {
      throw new Error('無法載入擴充數據');
    }

    return pluginsData;
  }
  catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching plugins:', error.message);
    }
    return [];
  }
}

type Props = {
  params: Promise<{ name: string }>;
};

export async function generateStaticParams() {
  const plugins = await fetchPlugins();
  return plugins.map((plugin: Plugin) => ({
    name: plugin.name,
  }));
}

export default async function PluginPage({ params }: Props) {
  // 等待解析 params
  const { name } = await params;
  const plugins = await fetchPlugins();

  return (
    <PluginPageClient
      initialPlugins={plugins}
      name={name}
    />
  );
}
