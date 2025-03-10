/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'backend', // Docker service name
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
    // Using unoptimized to resolve Docker networking issue
    // This bypasses Next.js image optimization for remote images
    unoptimized: process.env.NODE_ENV === 'development',
    // Image format options still useful for local images
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Create an assetPrefix for development to handle image URLs
  assetPrefix: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
  // Enable React strict mode for better development experience
  reactStrictMode: true,
};

module.exports = nextConfig;