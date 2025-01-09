import { Config } from '@stencil/core';
import { visualizer } from 'rollup-plugin-visualizer';
import nodePolyfills from 'rollup-plugin-node-polyfills';

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
  buildEs5: false,
  // Add hash for file names for better caching
  hashFileNames: true,
  excludeUnusedDependencies: true,
  testing: {
    browserHeadless: "new",
  },
  plugins: [
    nodePolyfills(),
  ],
  rollupPlugins: {
    after: [
      process.env.NODE_ENV === 'development' ? visualizer() : null
    ].filter(Boolean),
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
