import baseConfig from '../../jest.config.base';

module.exports = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['./src/types', './src/index.ts'],
  coverageThreshold: {
    global: {
<<<<<<< Updated upstream
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
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
