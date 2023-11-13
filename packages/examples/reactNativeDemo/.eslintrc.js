/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  extends: '@react-native-community',
  ignorePatterns: ['metro.config.js', 'public', '.cache', 'node_modules','.eslintrc.js'],
};
