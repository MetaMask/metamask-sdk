const path = require('path');

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: [],
  root: true,
  "env": {
    "es6": true,
    "node": true
  },
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        '@typescript-eslint/consistent-type-definitions': [
          'error',
          'interface',
        ],
      },
    },
  ],

  ignorePatterns: [
    '!.prettierrc.js',
    '**/.eslintrc.js',
    '**/dist*/',
    'rollup.config.js',
  ],
};
