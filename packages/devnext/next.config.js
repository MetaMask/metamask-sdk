/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: [
    '@metamask/sdk-communication-layer',
    '@metamask/sdk',
    '@metamask/sdk-install-modal-web',
  ],
};

module.exports = nextConfig;
