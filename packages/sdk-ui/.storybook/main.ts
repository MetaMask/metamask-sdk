import type { StorybookConfig } from '@storybook/react-webpack5';
import path, { dirname, join } from 'path';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/components/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/screens/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  staticDirs: ['../assets/'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-jest'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/addon-react-native-web'),
   'storybook-addon-deep-controls',

    {
      name: '@storybook/addon-react-native-web',
      options: {
        modulesToTranspile: ['react-native-reanimated'],
        babelPlugins: [
          '@babel/plugin-proposal-export-namespace-from',
          'react-native-reanimated/plugin',
        ],
      },
    },
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-webpack5'),
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config, { configType }) => {
    if (!config.resolve) config.resolve = {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native-safe-area-context': path.resolve(
        __dirname,
        '../node_modules/react-native-safe-area-context',
      ),
      react: path.resolve(__dirname, '../../devreact/node_modules/react'),
      'react-dom': path.resolve(
        __dirname,
        '../../devreact/node_modules/react-dom',
      ),
      'react-native-paper': path.resolve(
        __dirname,
        '../node_modules/react-native-paper',
      ),
      '@metamask/ui': path.resolve(__dirname, '../src'),
    };

    return config;
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
