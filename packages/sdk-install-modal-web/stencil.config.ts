import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'sdk-install-modal-web',
  validatePrimaryPackageOutputTarget: true,
  outputTargets: [
    {
      type: 'dist-custom-elements',
      isPrimaryPackageOutputTarget: true,
    },
  ],
  testing: {
    browserHeadless: "new",
  },
};