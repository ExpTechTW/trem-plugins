import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/TREM-Plugins' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/TREM-Plugins' : '',
  trailingSlash: true,
};

export default nextConfig;