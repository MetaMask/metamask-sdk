/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

import { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  // All imported modules in your tests should be mocked automatically
  automock: false,

  // Stop running tests after `n` failures
  bail: 0,

  // A set of global variables that need to be available in all test environments
  globals: {},

  // An array of file extensions your modules use
  moduleFileExtensions: [
    'js',
    'mjs',
    'cjs',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node',
  ],

  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  testTimeout: 5000,

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: ['/node_modules/'],

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: ['/node_modules/', '\\.pnp\\.[^\\/]+$'],

  // Whether to use watchman for file crawling
  watchman: true,
};

export default config;
