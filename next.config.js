/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/project-management-tool',
assetPrefix: '/project-management-tool/',
trailingSlash: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  images: {
    domains: ["localhost", "api.example.com"],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
