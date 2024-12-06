'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Plugin from '@/modal/plugin';
import { usePluginStore } from '@/stores/plugins';

import ReadmeTab from './readme';
import VersionList from './version_list';

const PluginPageTab = ({ plugin, version }: { plugin: Plugin;version: string }) => {
  const router = useRouter();
  const plugins = usePluginStore((state) => state.plugins);

  const dependentPlugins = plugins.filter((p) =>
    Object.entries(p.dependencies).some(([key]) => key === plugin.name),
  );

  const handleDependencyClick = (packageName: string) => {
    const targetPlugin = plugins.find((p) => p.name === packageName);
    if (targetPlugin) {
      router.push(`/plugins/${packageName}`);
    }
  };

  return (
    <div className="lg:col-span-3">
      <Tabs defaultValue="readme" className="space-y-4">
        <TabsList>
          <TabsTrigger value="readme">說明文件</TabsTrigger>
          <TabsTrigger value="versions">版本列表</TabsTrigger>
          <TabsTrigger value="dependencies">相依性</TabsTrigger>
          <TabsTrigger value="dependents">被相依性</TabsTrigger>
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
                <VersionList plugin={plugin} version={version} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependencies">
          <Card>
            <CardContent className="p-6">
              <div className={`
                grid w-full grid-cols-1 gap-4
                sm:grid-cols-2
              `}
              >
                {Object.entries(plugin.dependencies || {}).map(([key, value]) => (
                  <div
                    key={key}
                    className={`
                      w-full rounded-lg border p-4 transition-colors
                      ${plugins.some((p) => p.name === key)
                    ? `
                      cursor-pointer
                      hover:bg-accent
                    `
                    : ''}
                    `}
                    onClick={() => handleDependencyClick(key)}
                    role={plugins.some((p) => p.name === key) ? 'button' : ''}
                    tabIndex={plugins.some((p) => p.name === key) ? 0 : undefined}
                  >
                    <div className="break-words font-medium">{key}</div>
                    <div className="break-words text-sm text-muted-foreground">
                      {`需要版本: ${value}`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependents">
          <Card>
            <CardContent className="p-6">
              {dependentPlugins.length > 0
                ? (
                    <div className={`
                      grid w-full grid-cols-1 gap-4
                      sm:grid-cols-2
                    `}
                    >
                      {dependentPlugins.map((dep) => {
                        const dependencyVersion = dep.dependencies[plugin.name];
                        return (
                          <div
                            key={dep.name}
                            className={`
                              w-full cursor-pointer rounded-lg border p-4
                              hover:bg-accent
                            `}
                            onClick={() => router.push(`/plugins/${dep.name}`)}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="break-words font-medium">{dep.name}</div>
                            <div className={`
                              break-words text-sm text-muted-foreground
                            `}
                            >
                              {dependencyVersion && `需要 ${plugin.name} 版本: ${dependencyVersion}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                : (
                    <div className={`
                      w-full py-8 text-center text-muted-foreground
                    `}
                    >
                      目前沒有其他擴充相依於此擴充
                    </div>
                  )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PluginPageTab;
