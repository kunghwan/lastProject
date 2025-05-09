import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "https://github.com/kunghwan/lastProject"
      : "",
  images: {
    domains: ["tong.visitkorea.or.kr"], // ✅ 이미지 호스트 등록
  },
};

export default nextConfig;
