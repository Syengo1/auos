import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CRITICAL: Tells Next.js to compile raw TypeScript files from your internal workspace packages
  transpilePackages: ["@auto-os/db", "@auto-os/validate"],

  allowedDevOrigins: [
    "192.168.100.22", 
    "192.168.56.1",
    "localhost:3000",
    "https://noncalumnious-charley-unthrilling.ngrok-free.dev/",
  ],
};

export default nextConfig;