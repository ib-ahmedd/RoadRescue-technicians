import type { NextConfig } from "next";

const API_SERVER =
  process.env.API_SERVER_URL || "https://roadrescue-server.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_SERVER}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
