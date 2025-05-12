import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: "",
  images: {
    domains: [
      "tong.visitkorea.or.kr",
      "firebasestorage.googleapis.com",
      "i.pinimg.com",
    ],
  },
};

export default nextConfig;
