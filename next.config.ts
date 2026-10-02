import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // One canonical host: send the bare domain to www. /ads.txt is left out so
      // it keeps answering 200 on the bare domain, which is where AdSense reads it.
      {
        source: "/:path((?!ads\\.txt$).*)",
        has: [{ type: "host", value: "sansavingclub\\.com" }],
        destination: "https://www.sansavingclub.com/:path",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
