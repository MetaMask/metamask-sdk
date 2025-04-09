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
    '@metamask/sdk-react',
    '@metamask/sdk-react-ui',
    '@metamask/sdk-ui',
    '@metamask/sdk-lab',
    // Add more React Native / Expo packages here...
  ],
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve = {
      ...config.resolve,
      symlinks: false, // tells webpack to follow the real path of symlinked module instead of the symlink path itself
      fallback: {
        ...config.resolve.fallback,
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        zlib: require.resolve('browserify-zlib'),
      },
      alias: {
        ...config.resolve.alias,
        // Make sure the react version used is from our node_modules
        '@babel/runtime': path.resolve(
          __dirname,
          './node_modules/@babel/runtime',
        ),
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

    // Disable caching for development
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: path.resolve(__dirname, '.next/cache/webpack'),
      // Only cache node_modules except for sdk-install-modal-web
      managedPaths: [
        // Include all node_modules except sdk-install-modal-web
        path.resolve(__dirname, 'node_modules'),
      ],
      // Exclude the sdk package from caching using version check
      version: `${
        require('@metamask/sdk-install-modal-web/package.json').version
      }-${Date.now()}`,
    };

    // Add watch options to detect changes
    config.watchOptions = {
      aggregateTimeout: 300,
      poll: 1000,
      ignored: [
        '**/.git/**',
        '**/node_modules/**',
        '!**/node_modules/@metamask/sdk-install-modal-web/**',
      ],
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
        // This rule addresses an issue where .mjs files from @metamask/providers aren't correctly processed,
        // leading to runtime errors. By setting `type: 'javascript/auto'`, we ensure webpack treats these
        // files as JavaScript modules, preventing the 'Class extends value #<Object> is not a constructor or null' error.
        test: /\.mjs$/,
        include: /node_modules\/@metamask\/providers/,
        type: 'javascript/auto',
      },
      {
        // This rule addresses an issue where .mjs files from @metamask/providers aren't correctly processed,
        // leading to runtime errors. By setting `type: 'javascript/auto'`, we ensure webpack treats these
        // files as JavaScript modules, preventing the 'Class extends value #<Object> is not a constructor or null' error.
        test: /\.mjs$/,
        include: /node_modules\/@metamask\/json-rpc-engine/,
        type: 'javascript/auto',
      },
      {
        // This rule addresses an issue where .mjs files from @metamask/providers aren't correctly processed,
        // leading to runtime errors. By setting `type: 'javascript/auto'`, we ensure webpack treats these
        // files as JavaScript modules, preventing the 'Class extends value #<Object> is not a constructor or null' error.
        test: /\.mjs$/,
        include: /node_modules\/@metamask\/json-rpc-middleware-stream/,
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

    // Find the rule that handles JavaScript files
    const jsRule = config.module.rules.find(
      (rule) => rule.test && rule.test.test('.js'),
    );

    if (jsRule) {
      // Include @babel/runtime in the Babel loader
      jsRule.include = [
        ...(Array.isArray(jsRule.include)
          ? jsRule.include
          : [jsRule.include]
        ).filter(Boolean),
        path.resolve(__dirname, 'node_modules/@babel/runtime'),
      ];
    }

    // Add the babel-plugin-transform-import-meta to the loader options
    config.module.rules.forEach((rule) => {
      if (rule.use) {
        const use = Array.isArray(rule.use) ? rule.use : [rule.use];
        use.forEach((loader) => {
          if (
            typeof loader === 'object' &&
            loader.loader &&
            loader.loader.includes('babel-loader') &&
            loader.options
          ) {            loader.options.plugins = [
              ...(loader.options.plugins || []),
              'babel-plugin-transform-import-meta',
            ];
          }
        });
      }
    });

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
