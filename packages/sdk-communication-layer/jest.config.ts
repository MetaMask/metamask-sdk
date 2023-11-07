import baseConfig from '../../jest.config.base';

module.exports = {
  ...baseConfig,
  coveragePathIgnorePatterns: ['./src/types', '/index.ts$'],
  coverageThreshold: {
    global: {
<<<<<<< Updated upstream
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
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
