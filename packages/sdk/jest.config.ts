import baseConfig from '../../jest.config.base';

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    '^@metamask/sdk-types$': '<rootDir>/../sdk-types/src/index.ts',
    '^@metamask/analytics-client$': '<rootDir>/../analytics-client/src/index.ts',
    ...(baseConfig.moduleNameMapper || {}),
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@metamask/analytics-client|@metamask/sdk-types)/)',
    '\\\\.pnp\\\\.[^\\\\/]+$',
  ],
  transform: baseConfig.transform,
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
