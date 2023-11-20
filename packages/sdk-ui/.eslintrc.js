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
  ignorePatterns: ['*.js'],
  rules: {
    "react-hooks/exhaustive-deps": [
      "error",
      {
        "additionalHooks": "(useAnimatedStyle|useDerivedValue|useAnimatedProps)"
      }
    ]
  }
};
