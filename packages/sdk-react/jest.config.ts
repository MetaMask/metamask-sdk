import baseConfig from '../../jest.config.base';

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['./src/types', './src/index.ts'],
  resolver: '<rootDir>/jest.resolver.js',
  transformIgnorePatterns: [
    "node_modules/(?!(uuid)/)"  // Add other packages as needed
  ],
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    '^@metamask/sdk$': '<rootDir>/../sdk/src',
  },
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
};
