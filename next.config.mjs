/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack config to handle socket.io-client browser bundle
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
