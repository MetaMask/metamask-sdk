const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  chainWebpack: (config) => {
    config.module
      .rule('source-map')
      .test(/\.map$/)
      .use('source-map-loader')
      .loader('source-map-loader')
      .end()
      .enforce('pre');

    config.module
      .rule('ts-declaration')
      .test(/\.d\.ts$/)
      .use('null-loader')
      .loader('null-loader');
  }
})
