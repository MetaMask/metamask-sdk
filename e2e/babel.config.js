module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@': './test',
          '@util': './util',
          '@specs': './test/specs',
          '@screens': './src/screens',
          '@fixtures': './src/fixtures',
        },
      },
    ],
  ],
};
