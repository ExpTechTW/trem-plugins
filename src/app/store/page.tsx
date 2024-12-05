'use client';

import { AlertCircle, Loader2Icon } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import PluginList from '@/components/plugin_list';
import StatsSection from '@/components/status';
import TrafficChart from '@/components/traffic_chart';
import { usePluginStore } from '@/stores/plugins';

export default function StorePage() {
  const pluginStore = usePluginStore();

  useEffect(() => {
    void pluginStore.fetch();
  }, []);

  const error = false, isLoading = false;

  if (isLoading) {
    return (
      <div className="grid h-svh w-svw items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2Icon className="animate-spin" />
          <div className="text-lg">載入中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid h-svh w-svw items-center justify-center">
        <div className="flex items-center gap-2">
          <div>{error}</div>
          <Button
            onClick={() => void pluginStore.fetch()}
            variant="default"
          >
            重試
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-col gap-4">
        <main className="container mx-auto min-h-svh flex-1 px-4 py-8">
          {error && (
            <div className={`
              mb-4 border-l-4 border-yellow-500 bg-yellow-100 p-4
              dark:bg-yellow-900
            `}
            >
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
                <p className={`
                  text-yellow-700
                  dark:text-yellow-200
                `}
                >
                  {error}
                </p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold">TREM 擴充商店</h1>
          </div>

          <PluginList />
          <StatsSection />
          <div className="pt-8">
            <TrafficChart />
          </div>
        </main>
      </div>
    </div>
  );
}
