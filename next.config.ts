import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.filmtools.com" },
      { protocol: "https", hostname: "hotrodcameras.com" },
      { protocol: "https", hostname: "store.sirui.com" },
      { protocol: "https", hostname: "feelworld.ltd" },
      { protocol: "https", hostname: "irixlens.com" },
      { protocol: "https", hostname: "cdn.etoren.com" },
      { protocol: "https", hostname: "tamron-americas.com" },
    ],
  },
};

export default nextConfig;
