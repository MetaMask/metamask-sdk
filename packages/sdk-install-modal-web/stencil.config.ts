import { Config } from '@stencil/core';
import external from 'rollup-plugin-peer-deps-external';
import sizes from 'rollup-plugin-sizes';
import { visualizer } from 'rollup-plugin-visualizer';

// Check if environment variable is set to 'dev'
const isDev = process.env.NODE_ENV === 'dev';

const packageJson = require('./package.json');

export const config: Config = {
  namespace: 'sdk-install-modal-web',
  minifyJs: true,  
  validatePrimaryPackageOutputTarget: true,
  outputTargets: [
    {
      type: 'dist-custom-elements',
      isPrimaryPackageOutputTarget: true,
    },
  ],
  rollupPlugins: {
    before: [
      // Plugins injected before rollupNodeResolve()
      //resolvePlugin()
      external()
    ],
    after: [
      // Plugins injected after commonjs()
      isDev && sizes(),
      // terser(), handled by minifyJs option (uses terser plugin internally)
      isDev &&
        visualizer({
          filename: `bundle_stats/browser-es-stats-${packageJson.version}.html`,
        }),
    ]
  },
  testing: {
    browserHeadless: "new",
  },
};