module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/media/(.*)', // Apply to only the media files
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ]
  },
}
const dotenv = require('dotenv');
const path = require('path');

// Load the .env file from the parent directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });