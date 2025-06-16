module.exports = {
  root: true,

  extends: ['@metamask/eslint-config'],
  parserOptions: {
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: ['@metamask/eslint-config-typescript'],
      rules: {
        "import/no-unassigned-import": "off",
        "jsdoc/require-jsdoc": "off",
        "no-restricted-globals": "off",
        "@typescript-eslint/naming-convention": "off"
      }
    },

    {
      files: ['*.js'],
      parserOptions: {
        sourceType: 'script',
      },
      extends: ['@metamask/eslint-config-nodejs'],
    },

    {
      files: ['yarn.config.cjs'],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2020,
      },
      settings: {
        jsdoc: {
          mode: 'typescript',
        },
      },
      extends: ['@metamask/eslint-config-nodejs'],
    },

    {
      files: ['*.test.ts', '*.test.js'],
      extends: [
        '@metamask/eslint-config-jest',
        '@metamask/eslint-config-nodejs',
      ],
    },
  ],

  ignorePatterns: [
    '.eslintrc.cjs',
    '!.prettierrc.js',
    "build/",
    'dist/',
    'docs/',
    '.yarn/',
  ],
};
