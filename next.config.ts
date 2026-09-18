import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

if (isDev) {
  // Squat is a separate Vite app. In `next dev` there is no out/squat/, so
  // proxy the portfolio footer link to Vite. Static export cannot use rewrites,
  // so production still copies squat/dist into out/squat/ at build time.
  nextConfig.rewrites = async () => ({
    fallback: [
      {
        source: "/squat",
        destination: "http://127.0.0.1:5173/squat/",
      },
      {
        source: "/squat/:path*",
        destination: "http://127.0.0.1:5173/squat/:path*",
      },
    ],
  });
} else {
  nextConfig.output = "export";
}

export default nextConfig;
