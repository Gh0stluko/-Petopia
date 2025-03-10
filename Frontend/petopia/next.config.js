module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'backend', // Use the Docker service name
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
  },
}