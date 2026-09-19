import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["10.190.193.176"],
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
