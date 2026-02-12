import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs', 'pg'],
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
};

export default nextConfig;
