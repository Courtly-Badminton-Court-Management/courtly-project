import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        // ⚠️ WARNING: disables all ESLint checks during `next build`
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;