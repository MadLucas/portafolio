/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Menos trabajo en dev al importar iconos por barril
    optimizePackageImports: ['@heroicons/react', 'recharts'],
  },
}

export default nextConfig
