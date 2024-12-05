'use client';

import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import NavigationHeader from '@/components/navigation-header';
import { Button } from '@/components/ui/button';

interface SystemInfo {
  os: 'windows' | 'mac' | 'linux' | 'unknown';
  arch: 'x64' | 'arm64' | 'i32' | 'unknown';
}

interface GithubAsset {
  name: string;
  size: number;
  browser_download_url: string;
  created_at: string;
}

interface GithubRelease {
  tag_name: string;
  assets: GithubAsset[];
}

const formatFileSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
};

const getSystemInfo = (): SystemInfo => {
  if (typeof window === 'undefined') {
    return { os: 'unknown', arch: 'unknown' };
  }

  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  let os: SystemInfo['os'] = 'unknown';
  let arch: SystemInfo['arch'] = 'unknown';

  // macOS detection
  if (platform.includes('mac')) {
    os = 'mac';
    // For Apple Silicon Macs
    if (window.navigator.userAgent.includes('Mac') && window.navigator.userAgent.includes('Apple')) {
      arch = 'arm64';
    }
    else {
      arch = 'x64';
    }
  }
  // Windows detection
  else if (platform.includes('win')) {
    os = 'windows';
    arch = userAgent.includes('x64') || userAgent.includes('amd64') ? 'x64' : 'i32';
  }
  // Linux detection
  else if (platform.includes('linux')) {
    os = 'linux';
    arch = userAgent.includes('arm64') || userAgent.includes('aarch64') ? 'arm64' : 'x64';
  }

  return { os, arch };
};

export default function DownloadsPage() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({ os: 'unknown', arch: 'unknown' });
  const [releases, setReleases] = useState<GithubRelease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detected = getSystemInfo();
    console.log('Detected System:', detected);
    setSystemInfo(detected);

    const fetchReleases = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/repos/ExpTechTW/TREM-Lite/releases/latest',
        );

        if (!response.ok) {
          throw new Error('無法取得版本資訊');
        }

        const data = (await response.json()) as GithubRelease;
        setReleases(data);
      }
      catch (err) {
        console.error('Failed to fetch releases:', err);
      }
      finally {
        setLoading(false);
      }
    };

    void fetchReleases();
  }, []);

  const getDownloadLink = () => {
    if (!releases || systemInfo.os === 'unknown') {
      return null;
    }

    let searchPattern = '';
    if (systemInfo.os === 'mac') {
      searchPattern = systemInfo.arch === 'arm64' ? 'arm64.dmg' : 'x64.dmg';
    }

    const asset = releases.assets.find((asset) =>
      asset.name.toLowerCase().includes(searchPattern),
    );

    return asset
      ? {
          url: asset.browser_download_url,
          size: formatFileSize(asset.size),
        }
      : null;
  };

  const downloadLink = getDownloadLink();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <NavigationHeader />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavigationHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className={`
              inline-flex items-center text-sm text-gray-600
              dark:text-gray-400 dark:hover:text-gray-200
              hover:text-gray-900
            `}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首頁
          </Link>
        </div>

        <h1 className="mb-6 text-4xl font-bold">下載 TREM</h1>

        <div className="grid gap-6">
          <section className={`
            rounded-lg border p-6
            dark:border-gray-700
          `}
          >
            <div className="mb-4">
              <h2 className="text-2xl font-semibold">下載版本</h2>
              <p className={`
                mt-2 text-sm text-gray-600
                dark:text-gray-400
              `}
              >
                {systemInfo.os !== 'unknown'
                  ? `檢測到您的系統: ${systemInfo.os.toUpperCase()} (${systemInfo.arch})`
                  : '未知裝置，請從下方選擇適合的版本'}
              </p>
            </div>

            {downloadLink && (
              <div className="mb-6 space-y-4">
                <Button
                  asChild
                  size="lg"
                  className={`
                    w-full
                    sm:w-auto
                  `}
                >
                  <a
                    href={downloadLink.url}
                    className="inline-flex items-center"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    下載推薦版本 (
                    {downloadLink.size}
                    )
                  </a>
                </Button>
                {releases && (
                  <p className={`
                    text-sm text-gray-600
                    dark:text-gray-400
                  `}
                  >
                    版本：
                    {releases.tag_name}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">所有版本</h3>
              <div className="grid gap-4">
                {releases?.assets.map((asset) => (
                  <div
                    key={asset.name}
                    className={`
                      flex items-center justify-between rounded-lg border p-4
                      dark:border-gray-700
                    `}
                  >
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className={`
                        text-sm text-gray-600
                        dark:text-gray-400
                      `}
                      >
                        大小：
                        {formatFileSize(asset.size)}
                      </p>
                    </div>
                    <Button asChild variant="outline">
                      <a
                        href={asset.browser_download_url}
                        className="inline-flex items-center"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        下載
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={`
            rounded-lg border p-6
            dark:border-gray-700
          `}
          >
            <h2 className="mb-4 text-2xl font-semibold">系統需求</h2>
            <div className={`
              grid gap-4
              md:grid-cols-3
            `}
            >
              <div className={`
                rounded-md border p-4
                dark:border-gray-700
              `}
              >
                <h3 className="mb-2 font-semibold">Windows</h3>
                <ul className="space-y-2 text-sm">
                  <li>Windows 10 或更新版本</li>
                  <li>4GB RAM</li>
                  <li>200MB 硬碟空間</li>
                </ul>
              </div>
              <div className={`
                rounded-md border p-4
                dark:border-gray-700
              `}
              >
                <h3 className="mb-2 font-semibold">macOS</h3>
                <ul className="space-y-2 text-sm">
                  <li>macOS 11 或更新版本</li>
                  <li>4GB RAM</li>
                  <li>200MB 硬碟空間</li>
                </ul>
              </div>
              <div className={`
                rounded-md border p-4
                dark:border-gray-700
              `}
              >
                <h3 className="mb-2 font-semibold">Linux</h3>
                <ul className="space-y-2 text-sm">
                  <li>Ubuntu 20.04 或相容發行版</li>
                  <li>4GB RAM</li>
                  <li>200MB 硬碟空間</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
