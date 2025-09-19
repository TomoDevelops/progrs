import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  // Skip static optimization for API routes to prevent build-time errors
  trailingSlash: false,
  output: "standalone",
};

export default nextConfig;
