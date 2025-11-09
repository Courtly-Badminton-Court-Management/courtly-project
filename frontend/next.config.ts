// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "localhost",
      "127.0.0.1",
      "sgp1.digitaloceanspaces.com", // ✅ สำหรับ direct link จาก DO Spaces
      "courtly-bucket.sgp1.digitaloceanspaces.com", // ✅ สำหรับ subdomain ของ bucket (บาง region ใช้รูปนี้)
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8001",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8001",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "sgp1.digitaloceanspaces.com",
        pathname: "/courtly-bucket/**", // ✅ path ของพราวจริง ๆ
      },
      {
        protocol: "https",
        hostname: "courtly-bucket.sgp1.digitaloceanspaces.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
