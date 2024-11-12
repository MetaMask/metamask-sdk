const path = require('path');

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  extends: ['@react-native-community', 'prettier', 'plugin:storybook/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [path.resolve(__dirname, 'tsconfig.json')],
  },
  ignorePatterns: [
    '*.js',
    'dist',
    '.rollup.cache',
    '*/**/*.test.tsx',
    '*/**/*.test.ts',
  ],
  rules: {
    "react-hooks/exhaustive-deps": [
      "error",
      {
        "additionalHooks": "(useAnimatedStyle|useDerivedValue|useAnimatedProps)"
      }
    ],
    "react-native/no-inline-styles": 0,
  }
};
