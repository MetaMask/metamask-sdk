import baseConfig from '../../jest.config.base';

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,
  displayName: '@metamask/connect-evm',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['./src/index.ts'],
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
