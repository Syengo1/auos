import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables seamless Hot Module Replacement (HMR) for local network testing.
  // This allows you to view live code changes on your tablet or phone without refreshing.
  allowedDevOrigins: [
    "192.168.100.22", 
    "localhost:3000",
    "https://noncalumnious-charley-unthrilling.ngrok-free.dev/",
  ],

  // NOTE: If you previously had other configurations (like image remotePatterns or redirects),
  // they should remain inside this object.
};

export default nextConfig;