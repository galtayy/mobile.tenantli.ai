const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  reactStrictMode: true,
  output: 'export',
  images: {
    domains: ['localhost', 'https://api.tenantli.ai'],
    unoptimized: true
  }
})
