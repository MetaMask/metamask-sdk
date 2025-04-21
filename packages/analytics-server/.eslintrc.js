const path = require('path');

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: [
    '@metamask/eslint-config-nodejs', // Use nodejs config for server
    '@metamask/eslint-config-typescript',
    '../../.eslintrc.js' // Extend the root config
  ],
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [path.resolve(__dirname, 'tsconfig.eslint.json')], // Point to eslint tsconfig
  },

  ignorePatterns: [
    '.prettierrc.js',
    '**/.eslintrc.js',
    '**/jest.config.ts',
    '**/dist*/',
  ],
  
  // Remove env and basic rules as they are likely handled by extended configs
  // Keep specific overrides if necessary
  rules: {
    'node/no-process-env': 'off',
  }
}; 