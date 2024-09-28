/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '', // Make sure this is set correctly
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.un-autre-regard-sur-la-terre.org',
        port: '', // Empty string indicates no specific port
        pathname: '**', // Allow all paths under this domain
      },
    ],
  },
};

module.exports = nextConfig;
