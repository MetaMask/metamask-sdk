const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const glob = require('glob');

module.exports = {
    mode: 'production',
    entry: () => {
        const entries = {};
        const srcFiles = glob.sync('./src/**/*.ts');
        const testFiles = glob.sync('./test/**/*.ts');
        
        [...srcFiles, ...testFiles].forEach(file => {
            const entryName = path.relative('.', file).replace(/\.(ts|js)$/, '');
            entries[entryName] = file;
        });
        
        return entries;
    },
    output: {
        path: path.join(__dirname, 'dist'),
        libraryTarget: 'commonjs',
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
        ],
    },
    target: 'node',
    externals: /^(k6|https?\:\/\/)(\/.*)?/,
    // Generate map files for compiled scripts
    devtool: "source-map",
    stats: {
        colors: true,
    },
    plugins: [
        new CleanWebpackPlugin(),
        // Copy assets to the destination folder
        // see `src/post-file-test.ts` for an test example using an asset
        new CopyPlugin({
            patterns: [{
                from: path.resolve(__dirname, 'assets'),
                noErrorOnMissing: true
            }],
        }),
    ],
    optimization: {
        // Don't minimize, as it's not used in the browser
        minimize: false,
    },
};
