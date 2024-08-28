import { Buffer } from 'buffer';

// TODO refactor to have proper types on data
export const extractMethod = (
  chunk: any,
): { method: string; data: any; triggeredInstaller?: boolean } => {
  let data: any;
  if (Buffer.isBuffer(chunk)) {
    data = chunk.toJSON();
    data._isBuffer = true;
  } else {
    data = chunk;
  }

  const targetMethod = data?.data?.method as string;

  // Check if this request triggered the installer
  let triggeredInstaller = false;
  if (
    typeof data?.data?.params === 'object' &&
    data?.data?.params?.__triggeredInstaller === true
  ) {
    triggeredInstaller = true;
    // unwrap the params object
    data.data.params = data.data.params.wrappedParams;
  }

  return { method: targetMethod, data, triggeredInstaller };
};
