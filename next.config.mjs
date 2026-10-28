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

  async redirects() {
    return [
      {
        source: "/shipping-policy",
        destination: "/support-and-policy/policy-shipping",
        permanent: true,
      },
      {
        source: "/return-policy",
        destination: "/support-and-policy/policy-return",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/support-and-policy/policy-terms-and-condition",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/support-and-policy/policy-terms-and-condition",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        destination: "/support-and-policy/policy-privacy",
        permanent: true,
      },
      {
        source: "/support-and-policy/shipping",
        destination: "/support-and-policy/policy-shipping",
        permanent: true,
      },
      {
        source: "/support-and-policy/return",
        destination: "/support-and-policy/policy-return",
        permanent: true,
      },
      {
        source: "/support-and-policy/terms",
        destination: "/support-and-policy/policy-terms-and-condition",
        permanent: true,
      },
      {
        source: "/support-and-policy/terms-and-condition",
        destination: "/support-and-policy/policy-terms-and-condition",
        permanent: true,
      },
      {
        source: "/support-and-policy/policy-terms",
        destination: "/support-and-policy/policy-terms-and-condition",
        permanent: true,
      },
      {
        source: "/support-and-policy/privacy",
        destination: "/support-and-policy/policy-privacy",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
