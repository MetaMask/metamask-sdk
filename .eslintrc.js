module.exports = {
  extends: ['@metamask/eslint-config'],
  overrides: [
    {
      files: ['*.js'],
      extends: ['@metamask/eslint-config-nodejs'],
    },
    {
      files: ['rollup.config.js'],
      parserOptions: {
        sourceType: 'module',
      },
    },
    {
      files: ['src/**/*.ts'],
      env: {
        browser: true,
      },
    },
    {
      files: ['*.ts'],
      extends: ['@metamask/eslint-config-typescript'],
    },
  ],

  ignorePatterns: ['!.eslintrc.js', '!.prettierrc.js', 'dist'],
};
