module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['next/babel', 'babel-preset-expo'],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
      'react-native-reanimated/plugin',
      ["react-native-web", { commonjs: true }]
    ]
  };
};
