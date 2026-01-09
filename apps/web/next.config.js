/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@ncbs/ui", "@ncbs/dtos"],
  // Enable standalone output for optimized Docker builds
  output: "standalone",
};

module.exports = nextConfig;

