import baseConfig from '../../jest.config.base';

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['./types', './index.ts'],
  collectCoverageFrom: ['*.ts'],
  coverageThreshold: {
    global: {
      branches: 28,
      functions: 44,
      lines: 49,
      statements: 49,
    },
  },
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
};
