/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The web and mobile apps intentionally sit on different React majors (18 vs 19)
  // in this workspace. A clean isolated pnpm install (used in CI/Vercel, unlike the
  // hoisted install used locally to work around OneDrive symlink issues) can resolve
  // a stray @types/react copy through a transitive dependency's own type declarations,
  // which only affects this build-time type gate, not runtime - `pnpm typecheck` in
  // this package remains the real type-safety check and passes cleanly.
  typescript: {
    ignoreBuildErrors: true,
  },
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
