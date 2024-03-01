import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
import sizes from 'rollup-plugin-sizes';
import { visualizer } from 'rollup-plugin-visualizer';
import external from 'rollup-plugin-peer-deps-external';

// Check if environment variable is set to 'dev'
const isDev = process.env.NODE_ENV === 'dev';

const packageJson = require('./package.json');

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  {
    external: ['react', 'react-dom', 'react-native'],
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
