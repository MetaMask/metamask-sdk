const path = require('path');

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [path.resolve(__dirname, 'tsconfig.json')],
  },
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', '@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    "react/react-in-jsx-scope": "off",
    '@typescript-eslint/no-explicit-any': 'off',
    'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },

  ignorePatterns: [
    '.prettierrc.js',
    '**/.eslintrc.js',
    'craco.config.js',
    'config-overrides.js',
    'jest.config.ts',
    'mocks/**',
    '**/dist*/',
    'e2e/',
    'rollup.config.js',
  ],
};
