import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google OAuth profile photos
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // UploadThing CDN (both old and new URL formats)
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: '*.ufs.sh' },
      { protocol: 'https', hostname: 'uploadthing.com' },
      { protocol: 'https', hostname: '*.uploadthing.com' },
      // Cloudflare R2 (when added)
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: '*.cloudflare.com' },
      // Unsplash (for dev/placeholder images)
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    // Allow unoptimized images from trusted CDNs (fixes UploadThing thumbnails)
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '512mb', // ✅ increased to match video upload limit
    },
  },
  // Disable powered-by header (security)
  poweredByHeader: false,
};

export default nextConfig;
