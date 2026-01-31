/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Smaller builds, faster cold starts (optional for Vercel)
  poweredByHeader: false,
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // SWC minify is default in Next 14; keep for clarity
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Compress responses (default in production; explicit for clarity)
  compress: true,
}

module.exports = nextConfig
