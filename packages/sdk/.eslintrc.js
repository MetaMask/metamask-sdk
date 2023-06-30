const path = require('path');

module.exports = {
  extends: ['@metamask/eslint-config-typescript', '../../.eslintrc.js'],

  root: true,

  ignorePatterns: [
    '.prettierrc.js',
    '**/.eslintrc.js',
    'jest.config.ts',
    '**/dist*/',
    'e2e/',
    'rollup.config.js',
  ],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [path.resolve(__dirname, 'tsconfig.json')],
  },
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        '@typescript-eslint/consistent-type-definitions': [
          'error',
          'interface',
        ],
        '@typescript-eslint/no-floating-promises': 'error',
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
