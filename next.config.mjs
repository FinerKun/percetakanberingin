/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vdmsolvdwppbygjhxslv.supabase.co",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
