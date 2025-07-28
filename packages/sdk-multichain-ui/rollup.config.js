import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
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
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.module,
        format: 'es',
        sourcemap: true,
      },
      {
        file: packageJson.unpkg,
        format: 'umd',
        exports: 'named',
        name: 'MetaMaskSDKInstallModal',
        sourcemap: true
      },
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
    ],
    external: [],
    plugins: [
      external(),
      resolve({
        browser: true,
        extensions: ['.ts', '.tsx']
      }),
      commonjs(),
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            importHelpers: true,
            noEmitHelpers: true,
          },
        },
        useTsconfigDeclarationDir: true,
      }),
      postcss({
        extract: true,
        plugins: [],
        sourceMap: true,
        modules: true,
      }),
      terser(),
      isDev && visualizer({
        filename: `bundle_stats/${packageJson.version}/stats.html`,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
  },
];

export default config;
