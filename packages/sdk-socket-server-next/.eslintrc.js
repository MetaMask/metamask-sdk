module.exports = {
  root: true,

  extends: ['@metamask/eslint-config'],

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

    {
      files: ['**/*.test.ts', '**/*.test.js'],
      extends: ['@metamask/eslint-config-jest'],
      rules: {
        '@typescript-eslint/no-shadow': [
          'error',
          { allow: ['describe', 'expect', 'it'] },
        ],
      },
    },
  ],

  rules: {
    'import/no-named-as-default': 0,
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
  },

  ignorePatterns: [
    '!.prettierrc.js',
    '**/!.eslintrc.js',
    '**/dist*/',
    'rollup.config.js',
  ],
};
