import baseConfig from '../../jest.config.base';

module.exports = {
  ...baseConfig,
  coveragePathIgnorePatterns: ['./src/types', '/index.ts$'],
  coverageThreshold: {
    global: {
      branches: 68,
      functions: 72,
      lines: 75,
      statements: 78,
    },
  },
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
};
