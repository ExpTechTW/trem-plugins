'use client';

import { Download, Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { redirect, usePathname, useSearchParams } from 'next/navigation';

import NavigationHeader from '@/components/navigation-header';
import { Button } from '@/components/ui/button';
import VersionBadge from '@/components/dialogs/version';
import AnimatedCounter from '@/lib/counter';

interface SystemInfo {
  os: 'windows' | 'mac' | 'linux' | 'unknown';
  arch: 'x64' | 'arm64' | 'i32' | 'unknown';
}

interface GithubAsset {
  name: string;
  size: number;
  browser_download_url: string;
  created_at: string;
  download_count: number; // Added download count
}

interface GithubRelease {
  tag_name: string;
  assets: GithubAsset[];
  published_at: string;
}

interface DownloadStats {
  totalDownloads: number;
  versionDownloads: number;
}

const CACHE_DURATION = 1000 * 60 * 60;
const MAX_RELEASES = 5;

const formatFileSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('zh-TW').format(num);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getSystemInfo = (): SystemInfo => {
  if (typeof window === 'undefined') {
    return { os: 'unknown', arch: 'unknown' };
  }

  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  let os: SystemInfo['os'] = 'unknown';
  let arch: SystemInfo['arch'] = 'unknown';

  if (platform.includes('mac')) {
    os = 'mac';
    arch = window.navigator.userAgent.includes('Mac') && window.navigator.userAgent.includes('Apple') ? 'arm64' : 'x64';
  }
  else if (platform.includes('win')) {
    os = 'windows';
    arch = userAgent.includes('x64') || userAgent.includes('amd64') ? 'x64' : 'i32';
  }
  else if (platform.includes('linux')) {
    os = 'linux';
    arch = userAgent.includes('arm64') || userAgent.includes('aarch64') ? 'arm64' : 'x64';
  }

  return { os, arch };
};

const DownloadStats: React.FC<DownloadStats> = ({ totalDownloads, versionDownloads }) => {
  return (
    <div className="mb-4 grid grid-cols-2 gap-4">
      <AnimatedCounter
        end={totalDownloads}
        title="總下載量"
        formatter={(value: number) => value.toString()}
      />
      <AnimatedCounter
        end={versionDownloads}
        title="此版本下載量"
        formatter={(value: number) => value.toString()}
      />
    </div>
  );
};

export default function DownloadsPage({ initialVersion }: { initialVersion: string }) {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({ os: 'unknown', arch: 'unknown' });
  const [releases, setReleases] = useState<GithubRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleVersionChange = (version: string) => {
    setSelectedVersion(version);
    const params = new URLSearchParams(searchParams);
    params.set('version', version);
    redirect(`${pathname}?${params}`);
  };

  useEffect(() => {
    const detected = getSystemInfo();
    setSystemInfo(detected);

    const getFirstStableVersion = (releases: GithubRelease[]): string => {
      const targetVersion = releases.find((r) => r.tag_name.includes(initialVersion));
      if (targetVersion) return targetVersion.tag_name;

      const stableRelease = releases.find((release) =>
        !release.tag_name.includes('-rc') && !release.tag_name.includes('-pre'),
      );
      return stableRelease?.tag_name || releases[0]?.tag_name || '';
    };

    const fetchReleases = async () => {
      try {
        const cachedData = localStorage.getItem('tremReleases');
        const lastFetch = localStorage.getItem('lastReleasesFetch');
        const now = Date.now();

        if (cachedData && lastFetch && now - parseInt(lastFetch) < CACHE_DURATION) {
          const parsed = JSON.parse(cachedData) as GithubRelease[];
          setReleases(parsed);
          setSelectedVersion(getFirstStableVersion(parsed));
          setLoading(false);
          return;
        }

        const response = await fetch(
          'https://api.github.com/repos/ExpTechTW/TREM-Lite/releases',
        );

        if (!response.ok) throw new Error('無法取得版本資訊');

        const data = (await response.json()) as GithubRelease[];
        const recentReleases = data.slice(0, MAX_RELEASES);

        localStorage.setItem('tremReleases', JSON.stringify(recentReleases));
        localStorage.setItem('lastReleasesFetch', now.toString());

        setReleases(recentReleases);
        setSelectedVersion(getFirstStableVersion(recentReleases));
      }
      catch (err) {
        console.error('Failed to fetch releases:', err);
      }
      finally {
        setLoading(false);
      }
    };

    void fetchReleases();
  }, [initialVersion]);

  const getDownloadLink = (release: GithubRelease) => {
    if (systemInfo.os === 'unknown') return null;

    let searchPattern = '';
    if (systemInfo.os === 'mac') {
      searchPattern = systemInfo.arch === 'arm64' ? 'arm64.dmg' : 'x64.dmg';
    }

    const asset = release.assets.find((asset) =>
      asset.name.toLowerCase().includes(searchPattern),
    );

    return asset
      ? {
          url: asset.browser_download_url,
          size: formatFileSize(asset.size),
        }
      : null;
  };

  const calculateStats = () => {
    const totalDownloads = releases.reduce((total, release) =>
      total + release.assets.reduce((sum, asset) => sum + asset.download_count, 0), 0);

    const currentRelease = releases.find((r) => r.tag_name === selectedVersion);
    const versionDownloads = currentRelease
      ? currentRelease.assets.reduce((sum, asset) => sum + asset.download_count, 0)
      : 0;

    return { totalDownloads, versionDownloads };
  };

  const currentRelease = releases.find((r) => r.tag_name === selectedVersion);
  const downloadLink = currentRelease ? getDownloadLink(currentRelease) : null;
  const stats = calculateStats();

  if (loading) {
    return (
      <div className={`
        flex min-h-screen flex-col bg-white
        dark:bg-black
      `}
      >
        <NavigationHeader />
        <div className="flex flex-1 items-center justify-center">
          <Loader2Icon className="animate-spin" />
          <div className="text-lg">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      flex min-h-screen flex-col bg-white
      dark:bg-black
    `}
    >
      <NavigationHeader />
      <div className={`
        container mx-auto p-3
        sm:p-4
      `}
      >
        <div className={`
          grid gap-3
          lg:grid-cols-3
          sm:gap-4
        `}
        >
          <div className={`
            space-y-3
            lg:col-span-2
            sm:space-y-4
          `}
          >
            <div className={`
              rounded-lg border bg-white p-3
              dark:border-gray-700 dark:bg-black
              sm:p-4
            `}
            >
              <DownloadStats
                totalDownloads={stats.totalDownloads}
                versionDownloads={stats.versionDownloads}
              />
              <div className={`
                mb-3 flex flex-col gap-2
                sm:mb-4 sm:flex-row sm:items-center sm:justify-between
              `}
              >
                <div className={`
                  flex flex-col items-start gap-2
                  sm:flex-row sm:items-center
                `}
                >
                  <h1 className={`
                    text-xl font-bold
                    sm:text-2xl
                  `}
                  >
                    下載 TREM-Lite
                  </h1>
                  <VersionBadge version={selectedVersion} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`
                    text-sm text-gray-600
                    dark:text-gray-400
                  `}
                  >
                    版本：
                  </span>
                  <select
                    value={selectedVersion}
                    onChange={(e) => handleVersionChange(e.target.value)}
                    className={`
                      rounded-md border bg-white px-2 py-1 text-sm
                      dark:border-gray-700 dark:bg-gray-800
                    `}
                  >
                    {releases.map((release) => (
                      <option key={release.tag_name} value={release.tag_name}>
                        {release.tag_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`
                mb-3
                sm:mb-4
              `}
              >
                <p className={`
                  text-sm text-gray-600
                  dark:text-gray-400
                `}
                >
                  {systemInfo.os !== 'unknown'
                    ? `檢測到您的系統: ${systemInfo.os.toUpperCase()} (${systemInfo.arch})`
                    : '未知裝置，請從下方選擇適合的版本'}
                </p>
                {currentRelease && (
                  <p className={`
                    mt-1 text-sm text-gray-600
                    dark:text-gray-400
                  `}
                  >
                    發布時間：
                    {formatDate(currentRelease.published_at)}
                  </p>
                )}
              </div>

              {downloadLink && (
                <Button asChild size="lg" className="w-full">
                  <a
                    href={downloadLink.url}
                    className="inline-flex items-center justify-center"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    下載推薦版本 (
                    {downloadLink.size}
                    )
                  </a>
                </Button>
              )}
            </div>

            <div className={`
              rounded-lg border bg-white p-3
              dark:border-gray-700 dark:bg-black
              sm:p-4
            `}
            >
              <h2 className={`
                mb-3 text-lg font-semibold
                sm:text-xl
              `}
              >
                系統需求
              </h2>
              <div className={`
                grid grid-cols-1 gap-3
                sm:grid-cols-3
              `}
              >
                {['Windows', 'macOS', 'Linux'].map((os) => (
                  <div
                    key={os}
                    className={`
                      rounded-md border p-3
                      dark:border-gray-700
                    `}
                  >
                    <h3 className="mb-2 font-semibold">{os}</h3>
                    <ul className="space-y-1 text-sm">
                      <li>{os === 'Windows' ? 'Windows 10+' : os === 'macOS' ? 'macOS 11+' : 'Ubuntu 20.04+'}</li>
                      <li>4GB RAM</li>
                      <li>200MB 空間</li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            {currentRelease && (
              <div className={`
                rounded-lg border bg-white p-3
                dark:border-gray-700 dark:bg-black
                sm:p-4
              `}
              >
                <h3 className="mb-3 text-lg font-semibold">所有檔案</h3>
                <div className="space-y-2">
                  {currentRelease.assets.map((asset) => (
                    <div
                      key={asset.name}
                      className={`
                        rounded-lg border p-2
                        dark:border-gray-700
                        sm:p-3
                      `}
                    >
                      <p className="mb-1 truncate text-sm font-medium" title={asset.name}>
                        {asset.name}
                      </p>
                      <div className={`
                        flex items-center justify-between text-sm
                      `}
                      >
                        <div className="flex flex-col">
                          <span className={`
                            text-gray-600
                            dark:text-gray-400
                          `}
                          >
                            {formatFileSize(asset.size)}
                          </span>
                          <span className={`
                            text-xs text-gray-500
                            dark:text-gray-400
                          `}
                          >
                            下載量：
                            {formatNumber(asset.download_count)}
                          </span>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <a
                            href={asset.browser_download_url}
                            className="inline-flex items-center"
                          >
                            <Download className="mr-1 h-3 w-3" />
                            下載
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
