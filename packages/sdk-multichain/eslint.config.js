import base, { createConfig } from '@metamask/eslint-config';
import typescript from '@metamask/eslint-config-typescript';
import tseslint from '@typescript-eslint/eslint-plugin';

const config = createConfig(
  {
    // The TypeScript config disables certain rules that you want to keep for
    // non-TypeScript files, so it should be added in an override.
    files: ['src/**/*.ts'],
    ignores: ['dist/**', 'node_modules/**', 'src/schema.ts'],
    extends: [
      // This should be added last unless you know what you're doing.
      ...base,
      ...typescript,
    ],
    rules: {
      ...tseslint.configs['recommended'].rules,
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      '@typescript-eslint/naming-convention': 'off',
    },
    languageOptions: {
      parserOptions: {
        // This is required for rules that use type information.
        // See here for more information: https://typescript-eslint.io/getting-started/typed-linting
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);

export default config;



