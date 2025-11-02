/** @type {import('next').NextConfig} */
const nextConfig = {
  // Für Vercel: KEIN 'output: "export"', KEIN basePath/assetPrefix
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
