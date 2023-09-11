import baseConfig from '../../jest.config.base';

module.exports = {
  ...baseConfig,
  coveragePathIgnorePatterns: ['./src/types'],
  coverageThreshold: {
    global: {
      branches: 68,
      functions: 72,
      lines: 78,
      statements: 78,
    },
  },
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
};
