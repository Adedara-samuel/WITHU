/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@withu/shared-types",
    "@withu/validation",
    "@withu/constants",
    "@withu/game-engine",
    "@withu/shared-utils",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
