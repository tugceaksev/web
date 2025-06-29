import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['i.hizliresim.com'],
    unoptimized: true,
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.hizliresim.com',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
