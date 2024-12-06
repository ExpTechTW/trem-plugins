'use client';

import { CheckCircle, Clock, Download, Lock, RefreshCw, Shield, ShieldCheck, Star, Tag } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SiGithub } from '@icons-pack/react-simple-icons';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatNumber, formatTimeString, getRelativeTime } from '@/lib/utils';
import ActivityHeatmap from '@/components/activity_chart';
import GithubPeople from '@/components/github_people';
import { InstallButtons } from '@/components/install';
import PluginPageTab from '@/components/plugin_page';
import UnsafePluginWarning from '@/components/dialogs/warn';

import type Plugin from '@/modal/plugin';

function PluginContent({ plugin, plugins }: { plugin: Plugin; plugins: Plugin[] }) {
  const searchParams = useSearchParams();
  const version = searchParams.get('version') || '';

  return (
    <Suspense fallback={<div>載入中...</div>}>
      <PluginPageTab plugin={plugin} allPlugins={plugins} version={version} />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className={`
      container mx-auto flex flex-1 items-center justify-center px-4 py-8
    `}
    >
      <div className="text-center">載入中...</div>
    </div>
  );
}

export default function PluginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const [mounted, setMounted] = useState(false);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    async function loadPlugins() {
      try {
        const cachedPlugins = localStorage.getItem('tremPlugins');
        const lastFetch = localStorage.getItem('lastPluginsFetch');
        const now = Date.now();

        if (cachedPlugins && lastFetch && now - parseInt(lastFetch) < 300000) {
          const parsedPlugins = JSON.parse(cachedPlugins) as Plugin[];
          setPlugins(Array.isArray(parsedPlugins) ? parsedPlugins : []);
          setLoading(false);
          return;
        }

        const response = await fetch(
          'https://raw.githack.com/ExpTechTW/trem-plugins/refs/heads/main/data/repository_stats.json',
        );

        const pluginsData = (await response.json()) as Plugin[];

        if (!Array.isArray(pluginsData) || pluginsData.length === 0) {
          throw new Error('無法載入擴充數據');
        }

        localStorage.setItem('tremPlugins', JSON.stringify(pluginsData));
        localStorage.setItem('lastPluginsFetch', now.toString());
        setPlugins(pluginsData);
      }
      catch (error) {
        console.error('Failed to load plugins:', error);
      }
      finally {
        setLoading(false);
      }
    }

    void loadPlugins();
  }, []);

  if (!mounted || loading) {
    return (
      <LoadingState />
    );
  }

  if (!name) {
    router.push(`/store`);
    return <LoadingState />;
  }

  const plugin = plugins.find((p) => p.name === name);
  if (!plugin) {
    router.push(`/store`);
    return <LoadingState />;
  }

  const isVerified = plugin.author.includes('ExpTechTW');

  return (
    <div className="flex flex-col gap-4">
      <UnsafePluginWarning plugin={plugin} />
      <main className="container mx-auto min-h-svh flex-1 px-4 py-8">
        <div className={`
          grid grid-cols-1 gap-4
          lg:grid-cols-4
          sm:gap-6
        `}
        >
          <div className={`
            space-y-4
            lg:col-span-1
          `}
          >
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3">
                  <CardTitle className="text-xl font-bold">{plugin.name}</CardTitle>
                  {isVerified && (
                    <div className="flex translate-y-[1px] items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className={`
                            flex items-center gap-1.5 rounded-md bg-gray-800
                            px-3 py-1 text-xs text-white transition-colors
                            dark:bg-gray-700 dark:hover:bg-gray-600
                            hover:bg-gray-700
                          `}
                          >
                            <CheckCircle size={16} className="text-green-400" />
                            官方認證
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader className="text-left">
                            <div className="flex items-center gap-3">
                              <div className={`
                                rounded-full bg-green-50 p-2
                                dark:bg-green-900/20
                              `}
                              >
                                <CheckCircle className={`
                                  h-6 w-6 text-green-500
                                  dark:text-green-400
                                `}
                                />
                              </div>
                              <DialogTitle className="text-xl">官方認證</DialogTitle>
                            </div>
                            <DialogDescription asChild>
                              <div className="mt-4 space-y-4">
                                <div>此認證標章表示擴充已通過官方認證，需符合以下條件：</div>

                                <div className="space-y-3">
                                  <div className={`
                                    flex items-center gap-2 text-sm
                                  `}
                                  >
                                    <Shield className="h-5 w-5 text-blue-500" />
                                    <span>高穩定性，不易受軟體更新影響</span>
                                  </div>

                                  <div className={`
                                    flex items-center gap-2 text-sm
                                  `}
                                  >
                                    <Lock className="h-5 w-5 text-purple-500" />
                                    <span>沒有任何可能導致安全疑慮的程式碼</span>
                                  </div>

                                  <div className={`
                                    flex items-center gap-2 text-sm
                                  `}
                                  >
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    <span>建議使用經過官方認證的擴充功能以確保安全性</span>
                                  </div>
                                </div>

                                <div>建議使用經過官方認證的擴充功能以確保安全性。</div>
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className={`
                            flex items-center gap-1.5 rounded-md bg-gray-800
                            px-3 py-1 text-xs text-white transition-colors
                            dark:bg-gray-700 dark:hover:bg-gray-600
                            hover:bg-gray-700
                          `}
                          >
                            <ShieldCheck size={16} className="text-blue-400" />
                            安全載入
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader className="text-left">
                            <div className="flex items-center gap-3">
                              <div className={`
                                rounded-full bg-blue-50 p-2
                                dark:bg-blue-900/20
                              `}
                              >
                                <ShieldCheck className={`
                                  h-6 w-6 text-blue-500
                                  dark:text-blue-400
                                `}
                                />
                              </div>
                              <DialogTitle className="text-xl">安全載入</DialogTitle>
                            </div>
                            <DialogDescription asChild>
                              <div className="mt-4 space-y-4">
                                <div>安全載入指的是在執行擴充功能時，確保擴充功能的執行不會影響軟體的穩定性。</div>

                                <div className="space-y-3">
                                  <div className={`
                                    flex items-center gap-2 text-sm
                                  `}
                                  >
                                    <Shield className="h-5 w-5 text-blue-500" />
                                    <span>限制擴充使用可能導致軟體崩潰的大多數高風險操作</span>
                                  </div>
                                </div>

                                <div>透過這種方式，能最大程度降低擴充功能對軟體的潛在影響。</div>
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {plugin.description.zh_tw}
                  </p>
                  <GithubPeople people={plugin.author} />
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className={`
                  grid grid-cols-1 gap-6 border-t pt-4
                  md:grid-cols-2
                `}
                >
                  <div className="space-y-4">
                    <div className="text-muted-foreground">
                      <div className={`
                        mb-1.5 flex items-center gap-2 font-medium
                      `}
                      >
                        <RefreshCw size={16} className="shrink-0" />
                        <span>資料同步</span>
                      </div>
                      <Tooltip>
                        <TooltipContent>{formatTimeString(plugin.updated_at)}</TooltipContent>
                        <TooltipTrigger>{getRelativeTime(plugin.updated_at)}</TooltipTrigger>
                      </Tooltip>
                    </div>

                    <div className="text-muted-foreground">
                      <div className={`
                        mb-1.5 flex items-center gap-2 font-medium
                      `}
                      >
                        <Tag size={16} className="shrink-0" />
                        <span>最新版本</span>
                      </div>
                      <div>{plugin.repository.releases.releases[0]?.tag_name ?? '無'}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-muted-foreground">
                      <div className={`
                        mb-1.5 flex items-center gap-2 font-medium
                      `}
                      >
                        <Clock size={16} className="shrink-0" />
                        <span>最後更新</span>
                      </div>
                      {plugin.repository.releases.releases[0]?.published_at
                        ? (
                            <Tooltip>
                              <TooltipContent>
                                {formatTimeString(plugin.repository.releases.releases[0].published_at)}
                              </TooltipContent>
                              <TooltipTrigger>
                                {getRelativeTime(plugin.repository.releases.releases[0].published_at)}
                              </TooltipTrigger>
                            </Tooltip>
                          )
                        : (
                            <div className="ml-6">尚未發布</div>
                          )}
                    </div>

                    <div className="text-muted-foreground">
                      <div className={`
                        mb-1.5 flex items-center gap-2 font-medium
                      `}
                      >
                        <Download size={16} className="shrink-0" />
                        <span>總下載量</span>
                      </div>
                      <div>{formatNumber(plugin.repository.releases.total_downloads)}</div>
                    </div>
                  </div>
                </div>

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
            <ActivityHeatmap plugin={plugin} />
          </div>

          <div className="lg:col-span-3">
            <Suspense fallback={<div>載入中...</div>}>
              <PluginContent plugin={plugin} plugins={plugins} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
