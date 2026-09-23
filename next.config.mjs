/** @type {import('next').NextConfig} */
const nextConfig = {
  // The dev server is reached through the Cloudflare tunnel, and Next 16 blocks cross-origin dev requests.
  allowedDevOrigins: ["faisal6003.ssh.bd"],
  images: {
    // `images.domains` was deprecated and removed in Next 16 in favour of
    // remotePatterns, which is scoped to a protocol and path rather than
    // allowing any URL on the host.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
      {
        // Banner photography — see src/mock/photos.js.
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
