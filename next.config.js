/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",

  // Next.js 14: keep pdf-parse & mammoth out of the webpack client bundle
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "mammoth"],
  },

  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig
