// TODO refactor to have proper types on data
export const extractMethod = (chunk: any): { method: string; data: any } => {
  let data: any;
  if (Buffer.isBuffer(chunk)) {
    data = chunk.toJSON();
    data._isBuffer = true;
  } else {
    data = chunk;
  }

  const targetMethod = data?.data?.method as string;
  return { method: targetMethod, data };
};
