import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  assetPrefix: "", // ✅ GitHub 주소 쓰면 안 됨
};

export default nextConfig;
