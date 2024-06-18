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
    'jest.config.ts',
    'jest-preload.js',
    'bundle-size.js',
    '**/dist*/',
    'e2e/',
    'rollup.config.js',
    '**/coverage/**',
    'src/scripts/i18n-locales-auto-translate.js',
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
    {
      files: ['**/*.d.ts'],
      rules: {
        'import/unambiguous': 'off',
      },
    },
  ],
};
