import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/contactus", destination: "/contact", permanent: true },
      { source: "/xplorer", destination: "/xplorer/litecoin", permanent: false },
      { source: "/plans", destination: "/xtract#plans", permanent: false },
      { source: "/xtract/plans", destination: "/xtract#plans", permanent: false },
      { source: "/xtract/docs/reference", destination: "/xtract/docs#reference", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
