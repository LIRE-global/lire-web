import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is enabled by default in Next.js 16
  // Three.js works fine without custom webpack config
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
