import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
import sizes from 'rollup-plugin-sizes';
import { visualizer } from 'rollup-plugin-visualizer';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

// Check if environment variable is set to 'dev'
const isDev = process.env.NODE_ENV === 'dev';

const packageJson = require('./package.json');

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  {
    external: [
      'react',
      'react-dom',
      'react-native',
      'react-i18next',
      'i18next',
    ],
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.module,
        format: 'es',
        sourcemap: false,
      },
      {
        name: 'browser',
        file: packageJson.unpkg,
        format: 'umd',
        sourcemap: false,
      },
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: false,
      },
    ],
    plugins: [
      external(),
      resolve(),
      commonjs(),
      typescript({ sourceMap: false }),
      postcss({
        // Extract CSS to the same location as the JS file
        extract: true,
        // Use Sass compiler
        plugins: [],
        // Enable source maps
        sourceMap: true,
        // Enable CSS modules if needed
        modules: true,
        // Use additional plugins like `autoprefixer`
        // plugins: [require('autoprefixer')]
      }),
      isDev && sizes(),
      terser(),
      isDev &&
        visualizer({
          filename: `bundle_stats/browser-es-stats-${packageJson.version}.html`,
        }),
    ],
  },
];

export default config;
