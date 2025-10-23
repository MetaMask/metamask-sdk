import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

// Get dependencies from package.json - these should be treated as external
const allDependencies = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
];

/**
 * @type {import('rollup').RollupOptions[]}
 */
const configs = [
  // ESM and CJS builds
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: packageJson.exports['.'].import.default,
        format: 'es',
        sourcemap: true,
        exports: 'named',
      },
    ],
    external: (id) => {
      // Mark all dependencies as external
      return allDependencies.some(
        (dep) => id === dep || id.startsWith(`${dep}/`),
      );
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.build.json',
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
            declarationMap: true,
            sourceMap: true,
          },
          exclude: ['**/*.test.ts', '**/*.spec.ts', 'node_modules'],
        },
        useTsconfigDeclarationDir: false,
      }),
      nodeResolve({
        preferBuiltins: true,
      }),
      commonjs(),
      json(),
    ],
  },
];

export default configs;
