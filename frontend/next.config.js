const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  reactStrictMode: true,
  // output ayarını koşula bağlı olarak belirleyelim
  // eğer EXPORT_MODE değişkeni varsa output: 'export' olacak
  ...(process.env.EXPORT_MODE ? { output: 'export' } : {}),
  images: {
    domains: ['localhost', 'https://api.tenantli.ai'],
    unoptimized: true
  }
})
