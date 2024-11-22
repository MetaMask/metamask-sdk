import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'sdk-install-modal-web',
  validatePrimaryPackageOutputTarget: true,
  outputTargets: [
    {
      type: 'dist-custom-elements',
      isPrimaryPackageOutputTarget: true,
      minify: true,
    },
  ],
  enableCache: true,
  buildEs5: true,
  // Add hash for file names for better caching
  hashFileNames: true,
  excludeUnusedDependencies: true,
  testing: {
    browserHeadless: "new",
  },
};
