/** @type {import('next').NextConfig} */
const apiInternalUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:8000'

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/v1/:path*',
          destination: `${apiInternalUrl}/api/v1/:path*`,
        },
      ],
    }
  },
}

export default nextConfig
