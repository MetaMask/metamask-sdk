const path = require('path');

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: ['@metamask/eslint-config-typescript', '../../.eslintrc.js'],
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [path.resolve(__dirname, 'tsconfig.eslint.json')],
  },

  ignorePatterns: [
    '.prettierrc.js',
    '**/.eslintrc.js',
    '**/jest.config.ts',
    '**/dist*/',
    'e2e/',
    'rollup.config.js',
    'jest-preload.js',
  ],

  overrides: [
    {
      files: ['**/*.ts'],
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
  ],
};
