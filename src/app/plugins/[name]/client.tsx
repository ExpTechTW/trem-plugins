'use client';

import { ArrowLeft, CheckCircle, Clock, Download, Lock, RefreshCw, Shield, ShieldCheck, Star, Tag } from 'lucide-react';
import { SiGithub } from '@icons-pack/react-simple-icons';
import Link from 'next/link';
import { useState } from 'react';

import NavigationHeader from '@/components/navigation-header';
import AppFooter from '@/components/footer';
import GithubPeople from '@/components/github_people';
import { InstallButtons } from '@/components/install';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatNumber, formatTimeString, getRelativeTime } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import UnsafePluginWarning from '@/components/dialogs/warn';
import PluginPageTab from '@/components/plugin_page';
import ActivityHeatmap from '@/components/activity_chart';

import type { Plugin } from '@/modal/plugin';

function getPluginData(plugins: Plugin[], name: string): Plugin | null {
  return plugins.find((plugin) => plugin.name === name) || null;
}

export default function PluginPageClient({
  initialPlugins,
  name,
}: {
  initialPlugins: Plugin[];
  name: string;
}) {
  const [plugins] = useState(() => {
    if (typeof window !== 'undefined') {
      const cachedPlugins = localStorage.getItem('tremPlugins');
      const lastFetch = localStorage.getItem('lastPluginsFetch');
      const now = Date.now();

      if (cachedPlugins && lastFetch && now - parseInt(lastFetch) < 300000) {
        return JSON.parse(cachedPlugins) as Plugin[];
      }
    }

    if (initialPlugins.length > 0) {
      localStorage.setItem('tremPlugins', JSON.stringify(initialPlugins));
      localStorage.setItem('lastPluginsFetch', Date.now().toString());
    }

    return initialPlugins;
  });
  const plugin = getPluginData(plugins, name);
  const isVerified = plugin?.author.includes('ExpTechTW');

  if (!plugin) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavigationHeader />
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-4 text-2xl font-bold">找不到擴充</h1>
          <p>
            找不到名為
            {name}
            {' '}
            的擴充。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavigationHeader />
      <div className="flex flex-col gap-4">
        <UnsafePluginWarning plugin={plugin} />
        <main className="container mx-auto min-h-svh flex-1 px-4 py-8">
          <div className="mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/store" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                <span>返回商店</span>
              </Link>
            </Button>
          </div>

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
                              <DialogDescription className="mt-4 space-y-4">
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
                                    <span>開發者保持良好的互動記錄</span>
                                  </div>
                                </div>
                                <div>建議使用經過官方認證的擴充功能以確保安全性。</div>
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
                              <DialogDescription className="mt-4 space-y-4">
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

                                <div className={`
                                  text-sm text-gray-500
                                  dark:text-gray-400
                                `}
                                >
                                  透過這種方式，能最大程度降低擴充功能對軟體的潛在影響。
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

            <PluginPageTab plugin={plugin} allPlugins={plugins} />
          </div>
        </main>

        <AppFooter>
          <div className={`
            flex flex-col justify-between gap-2
            md:flex-row
          `}
          >
            <div>&copy; 2024 ExpTech Ltd.</div>
          </div>
        </AppFooter>
      </div>
    </div>
  );
}
