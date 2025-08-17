// next.config.mjs
// Using ES Module syntax (export default instead of module.exports)

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    outputStandalone: true,
  },
  compiler: {
    // removeConsole: true,
  },
  images: {
    domains: ["stay-hub.oss-me-central-1.aliyuncs.com"],
  },
};

export default nextConfig;