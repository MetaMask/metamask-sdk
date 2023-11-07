import baseConfig from '../../jest.config.base';

module.exports = {
  ...baseConfig,
  coveragePathIgnorePatterns: ['./src/types', '/index.ts$'],
  coverageThreshold: {
    global: {
<<<<<<< Updated upstream
      branches: 68,
      functions: 72,
      lines: 75,
      statements: 78,
=======
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
>>>>>>> Stashed changes
    },
  },
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
};
