import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import external from 'rollup-plugin-peer-deps-external';
import json from '@rollup/plugin-json';


const packageJson = require('./package.json');

/**
 * @type {import('rollup').RollupOptions}
 */
const config =
  [
    {
      external: ["react", "react-dom"],
      input: 'src/index.ts',
      output: [
        {
          file: packageJson.module,
          inlineDynamicImports: true,
          format: 'esm',
          sourcemap: true,
          sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
            // Not sure why rollup otherwise adds an extra '../' to the path

            // Adjust the path transformation logic as needed
            return relativeSourcePath.replace(/^..\//, '');
          },
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
