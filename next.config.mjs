/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nfowbvxizyygtrmnnzpi.supabase.co",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
