import type Plugin from '@/modal/plugin';

export async function fetchPlugins(): Promise<Plugin[]> {
  try {
    const response = await fetch(
      'https://raw.githack.com/ExpTechTW/trem-plugins/refs/heads/main/data/repository_stats.json',
      { next: { revalidate: 3600 } },
    );

    const pluginsData = await response.json() as Plugin[];

    if (pluginsData.length === 0) {
      throw new Error('無法載入擴充數據');
    }

    return pluginsData;
  }
  catch (error) {
    console.error('Error fetching plugins:', error);
    return [];
  }
}
