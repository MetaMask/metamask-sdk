import { defineConfig, type Options } from 'tsup';
import { umdWrapper } from 'esbuild-plugin-umd-wrapper';

const packageJson = require('./package.json');

// Dependencies categorization (same as rollup config)
const peerDependencies = Object.keys(packageJson.peerDependencies || {});
const optionalDependencies = Object.keys(packageJson.optionalDependencies || {});

// Dependencies that should be bundled
const bundledDeps = [ 'readable-stream'];
// Shared dependencies that should be deduplicated
const sharedDeps = ['eventemitter2', 'socket.io-client', 'debug', 'uuid', 'cross-fetch', '@metamask/sdk-analytics'];

// Filter function to exclude bundled dependencies
const excludeBundledDeps = (dep: string) => !bundledDeps.includes(dep);

// Dependencies that should always be external
const baseExternalDeps = [
  ...peerDependencies.filter(excludeBundledDeps),
  ...optionalDependencies.filter(excludeBundledDeps),
  ...sharedDeps,
  '@react-native-async-storage/async-storage',
  'extension-port-stream',
  '@metamask/utils',
];

// Platform-specific externals
const webExternalDeps = [...baseExternalDeps].filter(excludeBundledDeps);
const rnExternalDeps = [...baseExternalDeps].filter(excludeBundledDeps);
const nodeExternalDeps = [...baseExternalDeps].filter(excludeBundledDeps);

// Base configuration shared across all builds
const baseConfig: Partial<Options> = {
  bundle: true,
  tsconfig: './tsconfig.json',
  sourcemap: true,
  metafile: true,
  clean: false, // We handle cleaning via scripts
  dts: true, // We handle types separately via tsc
  splitting: false, // Keep bundle as single file to match rollup,
};


const entryName = packageJson.name.replace('@metamask/', '');

// TSUP Configuration
export default defineConfig([
  {
    ...baseConfig,
    entry: { [entryName]: 'src/index.browser.ts' },
    outDir: 'dist/browser/es',
    format: 'esm',
    platform: 'browser',
    external: webExternalDeps,
    esbuildOptions: (options) => {
      options.metafile = true;
      options.platform = 'browser';
      options.mainFields = ['browser', 'module', 'main'];
      options.conditions = ['browser'];
      options.outExtension = { ".js": '.mjs' };
    },
    banner: {
      js: '/* Browser ES build */',
    }
  },
  {
    ...baseConfig,
    entry: { [entryName]: 'src/index.browser.ts' },
    outDir: 'dist/browser/umd',
    platform: 'browser',
    external: [...baseExternalDeps, ...peerDependencies],
    esbuildPlugins: [
      umdWrapper({}) as any,
    ],
    esbuildOptions: (options) => {
      options.metafile = true;
      options.outExtension = { ".js": '.js' };
      options.platform = 'browser';
      options.mainFields = ['browser', 'module', 'main'];
      options.conditions = ['browser'];
    },
    banner: {
      js: '/* Browser UMD build */',
    },
  },
  {
    ...baseConfig,
    entry: { [entryName]: 'src/index.browser.ts' },
    outDir: 'dist/browser/iife',
    format: 'iife',
    platform: 'browser',
    external: [...baseExternalDeps, ...peerDependencies],
    globalName: 'MetaMaskSDK', // Matches rollup IIFE config
    esbuildOptions: (options) => {
      options.metafile = true;
      options.outExtension = { ".js": '.js' };
      options.platform = 'browser';
      options.mainFields = ['browser', 'module', 'main'];
      options.conditions = ['browser'];
    },
    banner: {
      js: '/* Browser IIFE build */',
    },
  },
  {
    ...baseConfig,
    entry: { [entryName]: 'src/index.node.ts' },
    outDir: 'dist/node/cjs',
    format: 'cjs',
    platform: 'node',
    external: nodeExternalDeps,
    esbuildOptions: (options) => {
      options.metafile = true;
      options.platform = 'node';
      options.mainFields = ['module', 'main'];
      options.conditions = ['node'];
      options.outExtension = { ".js": '.js' };
    },
    banner: {
      js: '/* Node.js CJS build */',
    },
  },
  {
    ...baseConfig,
    entry: { [entryName]: 'src/index.node.ts' },
    outDir: 'dist/node/es',
    format: 'esm',
    platform: 'node',
    external: nodeExternalDeps,
    esbuildOptions: (options) => {
      options.metafile = true;
      options.platform = 'node';
      options.mainFields = ['module', 'main'];
      options.conditions = ['node'];
      options.outExtension = { ".js": '.mjs' };
    },
    banner: {
      js: '/* Node.js ES build */',
    },
  },
  {
    ...baseConfig,
    entry: { [entryName]: 'src/index.native.ts' },
    outDir: 'dist/react-native/es',
    format: 'esm',
    platform: 'neutral', // React Native is neither pure browser nor pure node
    external: rnExternalDeps,
    esbuildOptions: (options) => {
      options.metafile = true;
      options.mainFields = ['react-native', 'node', 'browser'];
      options.conditions = ['react-native', 'node', 'browser'];
      options.outExtension = { ".js": '.mjs' };
    },
    banner: {
      js: '/* React Native ES build */',
    },
  },
  {
    ...baseConfig,
    entry: { [entryName]: 'src/index.browser.ts' },
    outDir: 'dist/types',
    dts: { only: true },
  }
]);