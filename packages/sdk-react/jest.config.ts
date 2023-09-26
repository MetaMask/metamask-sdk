import baseConfig from '../../jest.config.base';

module.exports = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['./src/types', './src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 88,
      functions: 100,
      lines: 97,
      statements: 98,
    },
  },
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
};
