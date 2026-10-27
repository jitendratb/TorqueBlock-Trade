/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Hero images are listed from public/hero at request time, so ship that folder with the server code.
  outputFileTracingIncludes: {
    "/**": ["./public/hero/**/*"],
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
