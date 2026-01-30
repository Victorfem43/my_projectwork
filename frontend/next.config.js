/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
  },
  // Ensure CSS is processed correctly
  swcMinify: true,
  // Ensure Tailwind CSS works properly
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
