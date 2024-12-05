import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { formatNumber } from '@/lib/utils';
import VersionBadge from '@/components/dialogs/version';

import type { Plugin, Release } from '@/modal/plugin';

const VersionItem = ({ release, plugin }: { release: Release; plugin: Plugin }) => (
  <div className="grid grid-cols-[1fr_auto] items-start gap-4">
    <div className="flex min-w-0 flex-col">
      <div className={`
        flex flex-col items-start gap-2
        sm:flex-row sm:items-center
      `}
      >
        <div className="flex gap-2">
          <span className="shrink-0">{release.tag_name}</span>
          <VersionBadge version={release.tag_name} />
        </div>
        <span className="text-sm text-muted-foreground">
          (
          {new Date(release.published_at).toLocaleDateString('zh-TW')}
          )
        </span>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        下載次數:
        {' '}
        {formatNumber(release.downloads)}
      </div>
    </div>
    <Button variant="outline" size="sm" asChild>
      <a
        href={`https://github.com/${plugin.repository.full_name}/releases/download/${release.tag_name}/${plugin.name}.trem`}
        download
      >
        下載
      </a>
    </Button>
  </div>
);

const RecommendedVersion = ({ release, plugin }: { release: Release; plugin: Plugin }) => (
  <div className={`
    rounded-lg border-2 border-green-500
    dark:border-green-700
  `}
  >
    <div className={`
      flex items-center gap-2 border-b border-green-500 bg-green-50 px-4 py-3
      dark:border-green-700 dark:bg-green-900/20
    `}
    >
      <div className={`
        rounded-full bg-green-100 p-1.5
        dark:bg-green-900/40
      `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className={`
        font-medium text-green-600
        dark:text-green-400
      `}
      >
        推薦版本
      </span>
    </div>
    <div className="p-4">
      <VersionItem release={release} plugin={plugin} />
    </div>
  </div>
);

const VersionList = ({ plugin }: { plugin: Plugin }) => {
  const releases = plugin.repository.releases.releases;
  if (!releases.length) return (
    <div className="w-full py-8 text-center text-muted-foreground">
      目前沒有發布的版本
    </div>
  );

  const getRecommendedVersion = () => {
    const stableVersion = releases.find((r) =>
      !r.tag_name.toLowerCase().includes('-pre')
      && !r.tag_name.toLowerCase().includes('-rc')
      && !r.tag_name.toLowerCase().startsWith('dev'),
    );
    if (stableVersion) return stableVersion;

    const rcVersion = releases.find((r) =>
      r.tag_name.toLowerCase().includes('-rc'),
    );
    if (rcVersion) return rcVersion;

    const preVersion = releases.find((r) =>
      r.tag_name.toLowerCase().includes('-pre'),
    );
    if (preVersion) return preVersion;

    return releases[0];
  };

  const recommendedVersion = getRecommendedVersion();
  const otherVersions = releases.filter((r) => r.tag_name !== recommendedVersion.tag_name);

  return (
    <TabsContent value="versions">
      <Card>
        <CardContent className={`
          space-y-6 p-4
          sm:p-6
        `}
        >
          <RecommendedVersion release={recommendedVersion} plugin={plugin} />
          {otherVersions.map((release) => (
            <div
              key={release.tag_name}
              className={`
                border-b pb-4
                last:border-0
              `}
            >
              <div className="pl-4 pr-4">
                <VersionItem release={release} plugin={plugin} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default VersionList;
