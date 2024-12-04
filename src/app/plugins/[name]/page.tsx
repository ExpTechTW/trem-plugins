import { SiGithub } from '@icons-pack/react-simple-icons';
import { Download, Tag, ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import Link from 'next/link';

import GithubPeople from '@/components/github_people';
import { InstallButtons } from '@/components/install';
import ReadmeTab from '@/components/readme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatNumber, formatTimeString, getRelativeTime } from '@/lib/utils';

import type { Plugin } from '@/modal/plugin';

async function fetchPlugins(): Promise<Plugin[]> {
  try {
    if (typeof window !== 'undefined') {
      const cachedPlugins = localStorage.getItem('tremPlugins');
      const lastFetch = localStorage.getItem('lastPluginsFetch');
      const now = Date.now();

      if (cachedPlugins && lastFetch && now - parseInt(lastFetch) < 600000) {
        return JSON.parse(cachedPlugins) as Plugin[];
      }
    }

    const response = await fetch(
      'https://raw.githack.com/ExpTechTW/trem-plugins/refs/heads/main/data/repository_stats.json',
      { next: { revalidate: 3600 } },
    );

    const pluginsData = await response.json() as Plugin[];

    if (typeof window !== 'undefined') {
      localStorage.setItem('tremPlugins', JSON.stringify(pluginsData));
      localStorage.setItem('lastPluginsFetch', Date.now().toString());
    }

    return pluginsData;
  }
  catch (error) {
    console.error('Error fetching plugins:', error);

    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem('tremPlugins');
      if (cachedData) {
        return JSON.parse(cachedData) as Plugin[];
      }
    }

    return [];
  }
}

export async function generateStaticParams() {
  const plugins = await fetchPlugins();
  return plugins.map((plugin) => ({
    name: plugin.name,
  }));
}

async function getPluginData(name: string): Promise<Plugin | null> {
  const plugins = await fetchPlugins();
  return plugins.find((plugin) => plugin.name === name) || null;
}

export default async function PluginPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const plugin = await getPluginData(name);

  if (!plugin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">找不到擴充</h1>
        <p>
          找不到名為
          {name}
          {' '}
          的擴充。
        </p>
      </div>
    );
  }

  return (
    <main className={`
      container mx-auto px-4 py-4
      sm:py-8
    `}
    >
      {/* 返回按鈕 */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>返回首頁</span>
          </Link>
        </Button>
      </div>

      <div className={`
        grid grid-cols-1 gap-4
        lg:grid-cols-4
        sm:gap-6
      `}
      >
        {/* 資訊區 - 在手機上顯示在上方 */}
        <div className={`
          space-y-4
          lg:col-span-1
        `}
        >
          <Card>
            <CardHeader className="space-y-3">
              <CardTitle className="break-words">{plugin.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {plugin.description.zh_tw}
              </p>
              <GithubPeople people={plugin.author} />
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 資訊區塊 - 使用 Grid 分為左右兩欄 */}
              <div className={`
                grid grid-cols-1 gap-6 border-t pt-4
                md:grid-cols-2
              `}
              >
                {/* 左欄 */}
                <div className="space-y-4">
                  <div className="text-muted-foreground">
                    <div className="mb-1.5 flex items-center gap-2 font-medium">
                      <RefreshCw size={16} className="shrink-0" />
                      <span>資料同步</span>
                    </div>
                    <div className="group relative ml-6">
                      <span className={`
                        cursor-help transition-colors
                        hover:text-foreground
                      `}
                      >
                        {getRelativeTime(plugin.updated_at)}
                      </span>
                      <span className={`
                        invisible absolute -top-8 left-0 z-10 whitespace-nowrap
                        rounded-md border bg-popover px-2.5 py-1.5 text-sm
                        shadow-md
                        group-hover:visible
                      `}
                      >
                        {formatTimeString(plugin.updated_at)}
                      </span>
                    </div>
                  </div>

                  <div className="text-muted-foreground">
                    <div className="mb-1.5 flex items-center gap-2 font-medium">
                      <Tag size={16} className="shrink-0" />
                      <span>最新版本</span>
                    </div>
                    <div className={`
                      ml-6 transition-colors
                      hover:text-foreground
                    `}
                    >
                      {plugin.repository.releases.releases[0]?.tag_name ?? '無版本'}
                    </div>
                  </div>
                </div>

                {/* 右欄 */}
                <div className="space-y-4">
                  <div className="text-muted-foreground">
                    <div className="mb-1.5 flex items-center gap-2 font-medium">
                      <Clock size={16} className="shrink-0" />
                      <span>最後更新</span>
                    </div>
                    {plugin.repository.releases.releases[0]?.published_at
                      ? (
                          <div className="group relative ml-6">
                            <span className={`
                              cursor-help transition-colors
                              hover:text-foreground
                            `}
                            >
                              {getRelativeTime(plugin.repository.releases.releases[0].published_at)}
                            </span>
                            <span className={`
                              invisible absolute -top-8 left-0 z-10
                              whitespace-nowrap rounded-md border bg-popover
                              px-2.5 py-1.5 text-sm shadow-md
                              group-hover:visible
                            `}
                            >
                              {formatTimeString(plugin.repository.releases.releases[0].published_at)}
                            </span>
                          </div>
                        )
                      : (
                          <div className="ml-6">尚未發布</div>
                        )}
                  </div>

                  <div className="text-muted-foreground">
                    <div className="mb-1.5 flex items-center gap-2 font-medium">
                      <Download size={16} className="shrink-0" />
                      <span>總下載量</span>
                    </div>
                    <div className={`
                      ml-6 transition-colors
                      hover:text-foreground
                    `}
                    >
                      {formatNumber(plugin.repository.releases.total_downloads)}
                      {' '}
                      次下載
                    </div>
                  </div>
                </div>
              </div>

              {/* GitHub 連結和安裝按鈕 */}
              <div className="space-y-4 border-t pt-4">
                <Link
                  href={plugin.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    flex items-center gap-2 text-sm text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  `}
                >
                  <SiGithub size={16} className="shrink-0" />
                  <span>GitHub</span>
                </Link>

                {plugin.repository.releases.releases.length > 0 && (
                  <InstallButtons plugin={plugin} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 內容區 */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="readme" className="space-y-4">
            <TabsList>
              <TabsTrigger value="readme">說明文件</TabsTrigger>
              <TabsTrigger value="versions">版本列表</TabsTrigger>
              <TabsTrigger value="dependencies">相依性</TabsTrigger>
            </TabsList>

            <TabsContent value="readme">
              <Card>
                <ReadmeTab plugin={plugin} />
              </Card>
            </TabsContent>

            <TabsContent value="versions">
              <Card>
                <CardContent className={`
                  p-4
                  sm:p-6
                `}
                >
                  <div className="space-y-6">
                    {plugin.repository.releases.releases.map((release) => (
                      <div
                        key={release.tag_name}
                        className={`
                          border-b pb-4
                          last:border-0
                        `}
                      >
                        <div className={`
                          mb-2 flex flex-col gap-2
                          sm:flex-row sm:items-start sm:justify-between
                        `}
                        >
                          <h3 className="font-medium">
                            {release.tag_name}
                            <span className={`
                              block text-sm text-muted-foreground
                              sm:ml-2 sm:inline
                            `}
                            >
                              (
                              {new Date(release.published_at).toLocaleDateString('zh-TW')}
                              )
                            </span>
                          </h3>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`https://github.com/${plugin.repository.full_name}/releases/download/${release.tag_name}/${plugin.name}.trem`}
                              download
                            >
                              下載
                            </a>
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          下載次數:
                          {' '}
                          {formatNumber(release.downloads)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dependencies">
              <Card>
                <CardContent className={`
                  p-4
                  sm:p-6
                `}
                >
                  <div className={`
                    grid grid-cols-1 gap-4
                    sm:grid-cols-2
                  `}
                  >
                    {Object.entries(plugin.dependencies).map(([key, value]) => (
                      <div key={key} className="rounded-lg border p-4">
                        <div className="break-words font-medium">{key}</div>
                        <div className={`
                          break-words text-sm text-muted-foreground
                        `}
                        >
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
