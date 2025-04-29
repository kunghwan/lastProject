import type { NextConfig } from "next";

const nextConfig: NextConfig = {};
module.exports = {
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "https://github.com/kunghwan/lastProject"
      : "",
};

export default nextConfig;
