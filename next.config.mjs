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
}

export default nextConfig;
