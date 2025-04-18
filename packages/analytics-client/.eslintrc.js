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
  ],

  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        // Add any specific rule overrides for analytics-client here if needed
        // Example:
        // '@typescript-eslint/consistent-type-definitions': [
        //   'error',
        //   'interface',
        // ],
      },
    },
  ],
}; 