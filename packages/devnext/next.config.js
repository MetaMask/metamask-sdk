const { withExpo } = require('@expo/next-adapter');
const path = require('path');
const fs = require('fs');

/** @type {import('next').NextConfig} */
const nextConfig = withExpo({
  reactStrictMode: false, // don't enable otherwise reanimated doesn't play nice.
  swcMinify: true,
  transpilePackages: [
    'react-native',
    'react-native-web',
    '@react-native/assets',
    'react-native-paper',
    'react-native-reanimated',
    'react-native-vector-icons',
    'react-native-safe-area-context',
    'react-native-gesture-handler',
    'expo',
    'expo-asset',
    'expo-font',
    'expo-module-core',
    'expo-modules-core',
    'react-native-jazzicon',
    '@expo/vector-icons',
    '@metamask/sdk-communication-layer',
    '@metamask/sdk',
    '@metamask/sdk-install-modal-web',
    '@metamask/sdk-react',
    '@metamask/sdk-react-ui',
    '@metamask/sdk-ui',
    '@metamask/sdk-lab',
    // Add more React Native / Expo packages here...
  ],
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      symlinks: false, // tells webpack to follow the real path of symlinked module instead of the symlink path itself
      alias: {
        ...config.resolve.alias,
        // Make sure the react version used is from our node_modules
        react: path.resolve(__dirname, './node_modules/react'),
        'react-native$': require.resolve('react-native-web'),
        // 'expo-asset': path.resolve(__dirname, './node_modules/expo-asset'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        'react-native-reanimated': path.resolve(
          __dirname,
          './node_modules/react-native-reanimated',
        ),
        'react-native-paper': path.resolve(
          __dirname,
          './node_modules/react-native-paper',
        ),
        'react-native-gesture-handler': path.resolve(
          __dirname,
          './node_modules/react-native-gesture-handler',
        ),
        'react-native-safe-area-context': path.resolve(
          __dirname,
          './node_modules/react-native-safe-area-context',
        ),
      },
    };
    config.module.rules.push(
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-react',
              { plugins: ['@babel/plugin-proposal-class-properties'] },
            ],
          },
        },
      },
      {
        test: /\.(js|jsx|mjs)$/,
        include: [
          // Add the path to the problematic module
          path.resolve(
            '../../packages/sdk-ui/node_modules/@react-native/assets-registry/registry.js',
          ),
          // Add other React Native modules if needed
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-flow'],
          },
        },
      },
      {
        test: /\.mjs$/,
        // Use a regex to match the specific path of the @metamask/providers package
        include: /node_modules\/@metamask\/providers/,
        type: 'javascript/auto',
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ['@svgr/webpack'],
      },
      {
        // Do not include png / jpg because nextjs optimizes them
        test: /\.(woff|woff2|eot|ttf)$/,
        type: 'asset/resource',
      },
    );

    // write config to disk for debugging
    fs.writeFileSync(
      './next.webpack.config.json',
      JSON.stringify(config.resolve, null, 2),
    );
    console.log(`Wrote webpack config to ./next.webpack.config.json`);
    return config;
  },
});

module.exports = nextConfig;
