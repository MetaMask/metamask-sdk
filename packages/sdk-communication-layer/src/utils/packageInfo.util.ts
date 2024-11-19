export interface PackageInfo {
  version: string;
  packageName: string;
  nodeEnv: 'development' | 'production';
}

export const getPackageInfo = (): PackageInfo => {
  // Values injected by rollup at build time
  return {
    version: process.env.PKG_VERSION ?? 'development',
    packageName: process.env.PKG_NAME ?? '@metamask/sdk-communication-layer',
    nodeEnv: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  };
};
