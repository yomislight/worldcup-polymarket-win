/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  expireTime: 600,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "polymarket-upload.s3.us-east-2.amazonaws.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
};
export default nextConfig;
