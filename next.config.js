/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/PortfolioV2',
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
