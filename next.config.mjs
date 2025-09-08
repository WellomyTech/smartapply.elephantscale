// next.config.mjs
const nextConfig = {
    trailingSlash: true,


  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
};
export default nextConfig;
