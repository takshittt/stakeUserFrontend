/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

  // Disable server-side features
  experimental: {
    optimizePackageImports: ["ethers", "thirdweb"],
  },

  // Environment variables for client-side
  env: {
    NEXT_PUBLIC_CLIENT_ID: process.env.NEXT_PUBLIC_CLIENT_ID,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_PRIVATE_KEY: process.env.NEXT_PUBLIC_PRIVATE_KEY,
  },
};

module.exports = nextConfig;
