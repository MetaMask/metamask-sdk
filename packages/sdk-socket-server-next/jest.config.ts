import baseConfig from '../../jest.config.base';

module.exports = {
  ...baseConfig,
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^analytics-node$': '<rootDir>/e2e/analytics-node.ts',
  },
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
  watchman: false,
};
