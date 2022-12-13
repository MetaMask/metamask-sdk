module.exports = {
  extends: ['@metamask/eslint-config-typescript', '../../.eslintrc.js'],

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
    '**/!.eslintrc.js',
    '**/dist*/',
    'rollup.config.js',
  ],
};
