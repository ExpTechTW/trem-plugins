import { type Plugin } from '@/modal/plugin';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as Tabs from '@radix-ui/react-tabs';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { Download, Tag, ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import { formatNumber, formatTimeString, getRelativeTime } from '@/lib/utils';
import GithubPeople from '@/components/github_people';
import { Button } from '@/components/ui/button';
import ReadmeTab from '@/components/readme';
import { InstallButtons } from '@/components/install';

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
        <h1 className="text-2xl font-bold mb-4">找不到擴充</h1>
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
    <main className="container mx-auto px-4 py-4 sm:py-8">
      {/* 返回按鈕 */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            <span>返回首頁</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 資訊區 - 在手機上顯示在上方 */}
        <div className="lg:col-span-1 space-y-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                {/* 左欄 */}
                <div className="space-y-4">
                  <div className="text-muted-foreground">
                    <div className="flex items-center gap-2 font-medium mb-1.5">
                      <RefreshCw size={16} className="shrink-0" />
                      <span>資料同步</span>
                    </div>
                    <div className="group relative ml-6">
                      <span className="cursor-help hover:text-foreground transition-colors">
                        {getRelativeTime(plugin.updated_at)}
                      </span>
                      <span className="invisible group-hover:visible absolute left-0 -top-8
                bg-popover px-2.5 py-1.5 rounded-md text-sm shadow-md whitespace-nowrap
                border z-10"
                      >
                        {formatTimeString(plugin.updated_at)}
                      </span>
                    </div>
                  </div>

                  <div className="text-muted-foreground">
                    <div className="flex items-center gap-2 font-medium mb-1.5">
                      <Tag size={16} className="shrink-0" />
                      <span>最新版本</span>
                    </div>
                    <div className="ml-6 hover:text-foreground transition-colors">
                      {plugin.repository.releases.releases[0]?.tag_name ?? '無版本'}
                    </div>
                  </div>
                </div>

                {/* 右欄 */}
                <div className="space-y-4">
                  <div className="text-muted-foreground">
                    <div className="flex items-center gap-2 font-medium mb-1.5">
                      <Clock size={16} className="shrink-0" />
                      <span>最後更新</span>
                    </div>
                    {plugin.repository.releases.releases[0]?.published_at
                      ? (
                          <div className="group relative ml-6">
                            <span className="cursor-help hover:text-foreground transition-colors">
                              {getRelativeTime(plugin.repository.releases.releases[0].published_at)}
                            </span>
                            <span className="invisible group-hover:visible absolute left-0 -top-8
                  bg-popover px-2.5 py-1.5 rounded-md text-sm shadow-md whitespace-nowrap
                  border z-10"
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
                    <div className="flex items-center gap-2 font-medium mb-1.5">
                      <Download size={16} className="shrink-0" />
                      <span>總下載量</span>
                    </div>
                    <div className="ml-6 hover:text-foreground transition-colors">
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
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
          <Tabs.Root defaultValue="readme" className="space-y-4">
            <Tabs.List className="flex flex-wrap p-1 gap-2 bg-muted rounded-lg" aria-label="選擇內容">
              <Tabs.Trigger
                value="readme"
                className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow transition-colors"
              >
                說明文件
              </Tabs.Trigger>
              <Tabs.Trigger
                value="versions"
                className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow transition-colors"
              >
                版本列表
              </Tabs.Trigger>
              <Tabs.Trigger
                value="dependencies"
                className="flex-1 px-3 py-2 text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow transition-colors"
              >
                相依性
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="readme" className="outline-none">
              <Card>
                <ReadmeTab plugin={plugin} />
              </Card>
            </Tabs.Content>

            <Tabs.Content value="versions" className="outline-none">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-6">
                    {plugin.repository.releases.releases.map((release) => (
                      <div key={release.tag_name} className="border-b pb-4 last:border-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                          <h3 className="font-medium">
                            {release.tag_name}
                            <span className="block sm:inline text-sm text-muted-foreground sm:ml-2">
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
            </Tabs.Content>

            <Tabs.Content value="dependencies" className="outline-none">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(plugin.dependencies).map(([key, value]) => (
                      <div key={key} className="p-4 border rounded-lg">
                        <div className="font-medium break-words">{key}</div>
                        <div className="text-sm text-muted-foreground break-words">{value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </main>
  );
}
