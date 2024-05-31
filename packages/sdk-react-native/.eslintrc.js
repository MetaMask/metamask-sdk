const path = require('path');

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: ['@metamask/eslint-config-typescript', '../../.eslintrc.js'],
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [path.resolve(__dirname, 'tsconfig.json')],
  },
  "settings": {
    'import/ignore': ['react-native'],
    "import/resolver": {
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx", ".native.js", ".native.ts", ".native.tsx"]
      }
    }
  },
  overrides: [
    {
      files: ['**/*.ts'],
      extends: ['@metamask/eslint-config-typescript'],
      rules: {
        '@typescript-eslint/consistent-type-definitions': [
          'error',
          'interface',
        ],
        '@typescript-eslint/no-floating-promises': 'error',
        'no-async-promise-executor': 'error',
        'import/no-named-as-default': 0,
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
      },
    },
    {
      files: ['**/*.tsx'],
      extends: ['@metamask/eslint-config-typescript'],
      rules: {
        '@typescript-eslint/consistent-type-definitions': [
          'error',
          'interface',
        ],
        '@typescript-eslint/no-floating-promises': 'error',
        'no-async-promise-executor': 'error',
        'import/no-named-as-default': 0,
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
      },
    },

    {
      files: ['**/*.test.ts', '**/*.test.js'],
      extends: ['@metamask/eslint-config-jest'],
      rules: {
        '@typescript-eslint/no-shadow': [
          'error',
          { allow: ['describe', 'expect', 'it'] },
        ],
      },
    },
  ],

  rules: {
    'import/no-named-as-default': 0,
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
  },

  ignorePatterns: [
    '.prettierrc.js',
    'babel.config.js',
    '**/.eslintrc.js',
    'jest.config.ts',
    '**/dist*/',
    'jest.resolver.js',
    'rollup.config.js',
    'jest-preload.js',
    'webpack.config.js',
    '**/coverage/**',
  ],
};
