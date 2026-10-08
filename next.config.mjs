/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  images: {
    qualities: [50, 70, 75, 85, 90],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.torqueblock.com" },
      { protocol: "https", hostname: "**.torqueblock.com" },
      { protocol: "https", hostname: "i.postimg.cc" },
    ],
  },
};

export default nextConfig;
