import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.190.193.176"],
  output: "export",
  trailingSlash: true,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
