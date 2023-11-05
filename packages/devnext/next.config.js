/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: [
    '@metamask/sdk-communication-layer',
    '@metamask/sdk',
    '@metamask/sdk-install-modal-web',
    '@metamask/sdk-react',
    '@metamask/sdk-react-ui',
  ],
};

module.exports = nextConfig;
