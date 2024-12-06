'use client';

import { Download, GitFork, Star } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import dynamic from 'next/dynamic';

import { Button } from '@/components/ui/button';

const DownloadSection = dynamic(() => Promise.resolve(() => {
  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-2 font-semibold">下載安裝</h3>
      <p className="mb-2">立即下載 TREM-Lite 開始使用完整功能</p>
      <Button asChild>
        <Link href="/downloads">
          <Download className="mr-2 h-4 w-4" />
          前往下載頁面
        </Link>
      </Button>
    </div>
  );
}), {
  ssr: false,
});

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-4xl font-bold">歡迎使用 TREM</h1>
      <div className="grid gap-6">
        <section className="rounded-lg border p-6">
          <h2 className="mb-4 text-2xl font-semibold">關於 TREM</h2>
          <p className="mb-4 text-lg">
            TREM 是一個強大的地震監測和警報系統，為臺灣地區提供即時地震資訊和預警服務。
          </p>
          <div className={`
            grid gap-4
            md:grid-cols-3
          `}
          >
            <div className="rounded-md border p-4">
              <h3 className="mb-2 font-semibold">即時監測</h3>
              <p>24/7 全天候監測台灣地區地震活動</p>
            </div>
            <div className="rounded-md border p-4">
              <h3 className="mb-2 font-semibold">快速通知</h3>
              <p>第一時間發送地震警報和相關資訊</p>
            </div>
            <div className="rounded-md border p-4">
              <h3 className="mb-2 font-semibold">擴充功能</h3>
              <p>豐富的擴充生態系統，打造個人化體驗</p>
            </div>
          </div>
        </section>

        {/* 新增的 GitHub 資訊區塊 */}
        <section className="rounded-lg border p-6">
          <h2 className="mb-4 text-2xl font-semibold">GitHub</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="https://github.com/TREM"
                className={`
                  text-lg font-medium
                  hover:underline
                `}
              >
                TREM-Lite
              </Link>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4" />
                  <span>11</span>
                </div>
                <div className="flex items-center">
                  <GitFork className="mr-1 h-4 w-4" />
                  <span>1</span>
                </div>
              </div>
            </div>
            <Button asChild>
              <Link href="https://github.com/ExpTechTW/TREM-Lite">
                查看原始碼
              </Link>
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
            <span>JavaScript</span>
          </div>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="mb-4 text-2xl font-semibold">開始使用</h2>
          <div className={`
            grid gap-4
            md:grid-cols-2
          `}
          >
            <DownloadSection />
            <div className="rounded-md border p-4">
              <h3 className="mb-2 font-semibold">瀏覽擴充功能</h3>
              <p className="mb-2">探索豐富的擴充功能，提升使用體驗</p>
              <Link href="/store">
                <Button variant="outline">
                  前往擴充商店
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
