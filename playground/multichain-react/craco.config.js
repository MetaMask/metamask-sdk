const webpack = require('webpack');

module.exports = {
	webpack: {
		configure: (webpackConfig) => {
			// Control export conditions (for packages with conditional exports)
			webpackConfig.resolve.conditionNames = [
       'browser', 'import','require', 'default'
			];

			// === NODE.JS POLYFILLS ===
			webpackConfig.resolve.fallback = {
				...webpackConfig.resolve.fallback,
				buffer: require.resolve('buffer'),
				process: require.resolve('process/browser.js'),
			};

			// === PROVIDE PLUGINS ===
			webpackConfig.plugins.push(
				new webpack.ProvidePlugin({
					Buffer: ['buffer', 'Buffer'],
					process: 'process/browser.js',
				}),
			);



			return webpackConfig;
		},
	},
};
