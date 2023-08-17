import typescript from '@rollup/plugin-typescript';
import external from 'rollup-plugin-peer-deps-external';

const packageJson = require('./package.json');

/**
 * @type {import('rollup').RollupOptions}
 */
const config =
  [
    {
      input: 'src/index.ts',
      output: {
        file: 'dist/cjs/index.js',
        format: 'cjs',
      },
      plugins: [
        external(),
        typescript(), // Add the TypeScript plugin
        // Other plugins as needed
      ],
    },
  ];

export default config;
