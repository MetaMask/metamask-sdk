import type { StorybookConfig } from '@storybook/react-webpack5';
import path, { dirname, join } from 'path';
import { Configuration, RuleSetRule } from 'webpack';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/components/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/design-system/components/Avatars/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/design-system/components/Badges/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/design-system/components/Banners/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/design-system/components/Buttons/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/design-system/components/Cards/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/design-system/components/Cells/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/design-system/components/Texts/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/design-system/components/Icons/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/screens/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  staticDirs: ['../assets/','../src/design-system/components/Icons/Icon/assets/'],
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
      'images/image-icons': path.resolve(
        __dirname,
        '../assets/images/image-icons',
      ),
      '@metamask/sdk-design-system': path.resolve(
        __dirname,
        '../src/design-system/',
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

    // Ensure config.module and config.module.rules are defined
    config.module = config.module || { rules: [] };

    // Find and modify the rule that handles SVG files
    const fileLoaderRule = config.module.rules?.find(
      (rule): rule is RuleSetRule => {
        if (rule && typeof rule === 'object' && 'test' in rule) {
          const testRegex = rule.test as RegExp;
          const match = testRegex.test('.svg');
          if(match) {
            console.log('match', rule);
          }
          return match;
        }
        return false;
      },
    );

    if (fileLoaderRule) {
      // Exclude SVGs from the existing rule
      fileLoaderRule.exclude = /\.svg$/;
    }

    // Add a new rule for handling SVGs with SVGR
    config.module.rules?.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
