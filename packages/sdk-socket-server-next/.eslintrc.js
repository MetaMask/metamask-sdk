const path = require('path');

module.exports = {
  root: true,
  extends: ['@metamask/eslint-config-typescript', '../../.eslintrc.js'],
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
  ],

  overrides: [
    {
      files: ['**/*.js'],
      extends: ['@metamask/eslint-config-nodejs'],
      parserOptions: {
        ecmaVersion: 9,
      },
    },

    {
      files: ['**/*.ts'],
      extends: ['@metamask/eslint-config-typescript'],
      rules: {
        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      },
    },

    // {
    //   files: ['**/*.test.ts', '**/*.test.js'],
    //   extends: ['@metamask/eslint-config-jest'],
    //   rules: {
    //     '@typescript-eslint/no-shadow': [
    //       'error',
    //       { allow: ['describe', 'expect', 'it'] },
    //     ],
    //   },
    // },
  ],

  rules: {
    'import/no-named-as-default': 0,
    '@typescript-eslint/no-useless-constructor': 0,
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
  },
};
