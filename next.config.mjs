/** @type {import('next').NextConfig} */

const nextConfig = {
  // output: 'export',  // Uncomment for static export (GitHub Pages)
  // distDir: 'out',
  images: {
    unoptimized: true,
  },
  // basePath: '/hodlCoin-Solidity-WebUI',  // Uncomment for GitHub Pages
  // Disable font optimization for better consistency
  optimizeFonts: false,
  // Prevent build hanging issues
  experimental: {
    esmExternals: false,
  },
}

export default nextConfig;
