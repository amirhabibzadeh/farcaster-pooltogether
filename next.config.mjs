/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'encoding')
    return config
  }
}

export default nextConfig

