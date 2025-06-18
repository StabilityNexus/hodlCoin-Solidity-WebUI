/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  basePath: '/hodlCoin-Solidity-WebUI',
  // Disable font optimization for better consistency
  optimizeFonts: false,
  // Prevent build hanging issues
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { isServer }) => {
    // Prevent hanging during build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Reduce memory usage during build
  staticPageGenerationTimeout: 120,
}

export default nextConfig;
