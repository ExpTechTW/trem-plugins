import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: "/TREM-Plugins",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;