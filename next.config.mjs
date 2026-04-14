/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // Menos trabajo en dev al importar iconos por barril
    optimizePackageImports: ['@heroicons/react', 'recharts'],
  },
}

export default nextConfig
