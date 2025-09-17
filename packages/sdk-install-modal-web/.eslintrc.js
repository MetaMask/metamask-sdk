/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,

  // extends: ['@metamask/eslint-config'],
  // TODO check if we can integrate to @metamask/eslint-config
  extends: ['eslint:recommended'],

  parser: '@typescript-eslint/parser',

  ignorePatterns: [
    '.eslintrc.js',
    'dist',
    'rollup.config.js',
    '**/coverage/**',
    'postcss.config.js',
    'jest-preload.js',
    'loader',
    '.stencil',
    'stencil.config.ts',
    'www'
  ],

  parserOptions: {
    project: true,
    // sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    // ecmaVersion: 2018,
    tsconfigRootDir: __dirname,
  },

  plugins: ['@typescript-eslint', 'react'],

  env: {
    browser: true,
    node: true,
    'shared-node-browser': true,
  },

  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'no-restricted-syntax': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error'],
        '@typescript-eslint/consistent-type-exports': [
          'error',
          {
            fixMixedExportsWithInlineTypeSpecifier: true,
          },
        ],
        '@typescript-eslint/consistent-type-definitions': [
          'error',
          'interface',
        ],
        'import/no-named-as-default': 0,
      },
    },
  ],
};
