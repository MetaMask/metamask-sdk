const path = require('path');

console.debug(`TWH`, path.resolve(__dirname, 'tsconfig.eslint.json'));
module.exports = {
  extends: ['@metamask/eslint-config-typescript',
      '../../.eslintrc.js',
      // 'plugin:@typescript-eslint/recommended',
      // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [path.resolve(__dirname, 'tsconfig.eslint.json')],
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
  ],

  ignorePatterns: [
    '.prettierrc.js',
    '**/.eslintrc.js',
    '**/jest.config.ts',
    '**/dist*/',
    'e2e/',
    'rollup.config.js',
  ],
};
