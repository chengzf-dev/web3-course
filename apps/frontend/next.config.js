/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@chengzf-dev/web3-course-ui", "@chengzf-dev/web3-course-lib"],
  experimental: {
    externalDir: true
  }
};

module.exports = nextConfig;
