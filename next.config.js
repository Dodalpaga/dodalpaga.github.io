/** @type {import('next').NextConfig} */
const nextConfig = {
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
  webpack: (config) => {
    // Fallback for 'fs' module (useful for libraries that require it)
    config.resolve.fallback = { fs: false };

    // Add support for importing .geojson and .json files directly
    config.module.rules.push(
      {
        test: /\.geojson$/,
        type: 'javascript/auto', // Tells Webpack to handle this as JavaScript (since GeoJSON is a type of JSON)
        use: 'json-loader', // Use json-loader to process .geojson files
      },
      {
        test: /\.json$/,
        type: 'javascript/auto', // Same for .json files
        use: 'json-loader',
      }
    );

    // Add transpile rule for three/examples
    config.module.rules.push({
      test: /\.d.ts$/,
      include: /node_modules\/three\/examples/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
        },
      },
    });

    return config;
  },
};

module.exports = nextConfig;
