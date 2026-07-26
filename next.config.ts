import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/Shrey.github.io",
  assetPrefix: "/Shrey.github.io",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
