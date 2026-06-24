/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // THIS IS CRITICAL - creates static HTML files
  distDir: 'out',    // Output directory name
  images: {
    unoptimized: true,  // Required for static export
  },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://mama-ai-api.onrender.com/api/v1',
  },
}

module.exports = nextConfig
