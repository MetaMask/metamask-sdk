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
        'import/no-named-as-default': 0,
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
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
