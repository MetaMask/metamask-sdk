import baseConfig from '../../jest.config.base';

module.exports = {
  ...baseConfig,
  coveragePathIgnorePatterns: ['./src/types', '/index.ts$'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
};
