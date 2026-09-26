/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // THIS IS CRITICAL - creates static HTML files
  distDir: 'out',    // Output directory name
  images: {
    unoptimized: true,  // Required for static export
  },
  trailingSlash: true,
  // NEXT_PUBLIC_API_URL is read directly from process.env at build time (Next.js inlines any
  // NEXT_PUBLIC_* var automatically — no `env` block needed). This used to hardcode a fallback to
  // the old Render URL here, which silently overrode app/lib/api.ts's own (safer, localhost) fallback
  // any time the real env var wasn't set at build time — i.e. every local build.
}

module.exports = nextConfig
