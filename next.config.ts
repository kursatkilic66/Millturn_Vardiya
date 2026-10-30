import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.190.193.176"],
  ...(isProd
    ? { output: "export", trailingSlash: true }
    : {
        async rewrites() {
          return [
            {
              source: "/api/local-db",
              destination: "http://127.0.0.1:3099/api/local-db",
            },
          ];
        },
      }),
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
