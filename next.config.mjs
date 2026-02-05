/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  skipTrailingSlashRedirect: true,
  // Exclude auth-protected routes from static generation
  experimental: {
    staticGenerationRetryCount: 3,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nitminer.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },

};

export default nextConfig;
