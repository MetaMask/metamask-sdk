module.exports = {
  root: true,
  extends: '@react-native',
  parserOptions: {
    project: [path.resolve(__dirname, 'tsconfig.json')],
    babelOptions: {
      configFile: path.resolve(__dirname, './babel.config.js'),
    },
  }
};
