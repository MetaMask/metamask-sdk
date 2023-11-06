import baseConfig from '../../jest.config.base';

module.exports = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['./src/types', './src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
};
