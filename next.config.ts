import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * YouTube thumbnail host, for the video rail on the home page.
     *
     * The videos themselves are the client's own, on their own channel, and are
     * embedded as facades — a thumbnail plus a play button, with the real
     * iframe mounted only on click. `i.ytimg.com` is where those thumbnails
     * live, and `next/image` refuses a remote host that is not declared here.
     *
     * Scoped to the thumbnail path rather than the whole host, so this cannot
     * quietly become a general-purpose proxy for anything on ytimg.
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
    ],
  },
};

export default nextConfig;
