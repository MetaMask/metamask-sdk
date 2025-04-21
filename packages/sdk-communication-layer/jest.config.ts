import baseConfig from '../../jest.config.base';

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    '^@metamask/analytics-client$': '<rootDir>/../analytics-client/src/index.ts',
    '^@metamask/sdk-types$': '<rootDir>/../sdk-types/src/index.ts',
    ...(baseConfig.moduleNameMapper || {}),
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@metamask/analytics-client|@metamask/sdk-types)/)',
    '\\\\.pnp\\\\.[^\\\\/]+$',
  ],
  coveragePathIgnorePatterns: ['./src/types', '/index.ts$'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
};
