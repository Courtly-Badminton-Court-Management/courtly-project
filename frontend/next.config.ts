import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ⚠️ Ignore ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Ignore TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
