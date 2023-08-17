import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import external from 'rollup-plugin-peer-deps-external';
import json from '@rollup/plugin-json';


const packageJson = require('./package.json');

const listDepForRollup = ['react','react-native','react-dom'];

/**
 * @type {import('rollup').RollupOptions}
 */
const config =
  [
    {
      external: listDepForRollup,
      input: 'src/index.ts',
      output: [
        {
          file: packageJson.module,
          inlineDynamicImports: true,
          format: 'esm',
          sourcemap: true,
        },
      ],
      plugins: [
        external(),
        nodeResolve({
          browser: true,
        }),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' }),
        json(),
        terser(),
      ],
    },
  ];

export default config;
