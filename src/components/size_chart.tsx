'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import React, { useEffect, useState } from 'react';

interface Release {
  tag_name: string;
  assets: Array<{
    name: string;
    size: number;
    browser_download_url: string;
  }>;
  published_at: string;
}

interface ChartData {
  'version': string;
  'Linux amd64'?: number;
  'Linux arm64'?: number;
  'macOS arm64'?: number;
  'macOS x64'?: number;
  'Windows ia32'?: number;
  'Windows x64'?: number;
}

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    fill?: string;
    stroke?: string;
    dataKey?: string;
  }>;
  label?: string;
};

interface PackageSizeChartProps {
  releases: Release[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`
        rounded-lg border border-gray-200 bg-white p-4 shadow-lg
        dark:border-gray-700 dark:bg-gray-800
      `}
      >
        <p className="mb-2 font-bold">{`版本: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.stroke || entry.fill }}>
            {`${entry.dataKey}: ${entry.value} MB`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PackageSizeChart: React.FC<PackageSizeChartProps> = ({ releases }) => {
  const [isMobile, setIsMobile] = useState(false);
  const colors: Record<string, string> = {
    'Linux amd64': '#FF6B6B',
    'Linux arm64': '#4ECDC4',
    'macOS arm64': '#45B7D1',
    'macOS x64': '#96CEB4',
    'Windows ia32': '#9B5DE5',
    'Windows x64': '#F7D794',
  };

  const [visibleTypes, setVisibleTypes] = useState<Record<string, boolean>>(
    Object.keys(colors).reduce((acc, type) => ({ ...acc, [type]: true }), {}),
  );

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const processData = (): ChartData[] => {
    return releases.map((release) => {
      const data: ChartData = {
        version: release.tag_name,
      };

      release.assets.forEach((asset) => {
        if (asset.name.endsWith('amd64.deb')) {
          data['Linux amd64'] = Number((asset.size / (1024 * 1024)).toFixed(2));
        }
        else if (asset.name.endsWith('arm64.deb')) {
          data['Linux arm64'] = Number((asset.size / (1024 * 1024)).toFixed(2));
        }
        else if (asset.name.endsWith('arm64.dmg')) {
          data['macOS arm64'] = Number((asset.size / (1024 * 1024)).toFixed(2));
        }
        else if (asset.name.endsWith('x64.dmg')) {
          data['macOS x64'] = Number((asset.size / (1024 * 1024)).toFixed(2));
        }
        else if (asset.name.endsWith('ia32.exe')) {
          data['Windows ia32'] = Number((asset.size / (1024 * 1024)).toFixed(2));
        }
        else if (asset.name.endsWith('x64.exe')) {
          data['Windows x64'] = Number((asset.size / (1024 * 1024)).toFixed(2));
        }
      });

      return data;
    }).reverse();
  };

  const data = processData();
  const packageTypes = Object.keys(colors);

  const handleTypeToggle = (type: string) => {
    setVisibleTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="w-full p-4">
      <h2 className="mb-6 text-center text-xl font-semibold">安裝包大小趨勢圖</h2>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {packageTypes.map((type) => (
          <button
            key={type}
            onClick={() => handleTypeToggle(type)}
            className={`
              rounded-full border px-3 py-1 text-sm font-medium transition-all
              duration-200
              ${
          visibleTypes[type]
            ? 'border-transparent text-white'
            : 'border-gray-300 bg-transparent text-gray-500'
          }
            `}
            style={{
              backgroundColor: visibleTypes[type] ? colors[type] : 'transparent',
            }}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: isMobile ? 0 : 20,
              bottom: 60,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e0e0e0"
              vertical={false}
            />
            <XAxis
              dataKey="version"
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis
              label={isMobile
                ? { value: '' }
                : {
                    value: '檔案大小 (MB)',
                    angle: -90,
                    position: 'insideLeft',
                    style: {
                      textAnchor: 'middle',
                      fill: '#666',
                      fontSize: 14,
                    },
                  }}
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <Tooltip content={<CustomTooltip />} />
            {packageTypes.map((type) => (
              visibleTypes[type] && (
                <Line
                  key={type}
                  type="monotone"
                  dataKey={type}
                  stroke={colors[type]}
                  strokeWidth={2}
                  dot={{
                    r: isMobile ? 3 : 4,
                    strokeWidth: 2,
                    fill: '#fff',
                  }}
                  activeDot={{
                    r: isMobile ? 4 : 6,
                    stroke: colors[type],
                    strokeWidth: 2,
                    fill: '#fff',
                  }}
                  connectNulls
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PackageSizeChart;
