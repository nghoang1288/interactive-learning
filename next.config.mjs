/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
};

export default nextConfig;