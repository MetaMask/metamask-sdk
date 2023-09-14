import baseConfig from '../../jest.config.base';

module.exports = {
  ...baseConfig,
  coveragePathIgnorePatterns: ['./src/types', '/index.ts$'],
  coverageThreshold: {
    global: {
      branches: 79,
      functions: 84,
      lines: 91,
      statements: 90,
    },
  },
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
};
