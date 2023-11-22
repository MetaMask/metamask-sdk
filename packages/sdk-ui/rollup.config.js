import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import external from 'rollup-plugin-peer-deps-external';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image';

const packageJson = require('./package.json');

/**
 * @type {import('rollup').RollupOptions}
 */
const config =
  [
    {
      external: ["react", "react-dom", "react-native"],
      input: 'src/index.ts',
      output: [
        {
          file: packageJson.module,
          format: 'esm',
          sourcemap: true,
        },
      ],
      plugins: [
        external(),
        image({include: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'], }),
        nodeResolve({
          browser: true,
        }),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json', allowJs: true }),
        json(),
        terser(),
      ],
    },
  ];

export default config;
