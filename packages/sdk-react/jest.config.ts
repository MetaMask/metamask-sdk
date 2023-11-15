import baseConfig from '../../jest.config.base';

module.exports = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['./src/types', './src/index.ts'],
  resolver: '<rootDir>/jest.resolver.js',
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
