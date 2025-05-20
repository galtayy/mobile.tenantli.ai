const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'https://api.tenantli.ai'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.tenantli.ai/api/:path*', // Düzeltilmiş API URL
      },
    ]
  },
})
