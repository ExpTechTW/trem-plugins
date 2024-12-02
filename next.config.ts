import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === 'production' 
    ? {
        output: 'export',
        basePath: "/TREM-Plugins",
        images: {
          unoptimized: true,
        },
      }
    : {
      }
  )
};

export default nextConfig;