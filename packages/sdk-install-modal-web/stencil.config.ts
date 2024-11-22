import { Config } from '@stencil/core';
import { visualizer } from 'rollup-plugin-visualizer';

export const config: Config = {
  namespace: 'sdk-install-modal-web',
  validatePrimaryPackageOutputTarget: true,
  outputTargets: [
    {
      type: 'dist',
      isPrimaryPackageOutputTarget: true,
    },
  ],
  enableCache: true,
  buildEs5: false, // Modern browser don't need ES5
  // Add hash for file names for better caching
  hashFileNames: true,
  excludeUnusedDependencies: true,
  testing: {
    browserHeadless: "new",
  },
  rollupPlugins: {
    after: [
      visualizer()
    ],
  },
  // Add treeshaking for better optimization
  extras: {
    enableImportInjection: true,
    scriptDataOpts: false,
    appendChildSlotFix: false,
    cloneNodeFix: false,
    slotChildNodesFix: false,
  }
};
