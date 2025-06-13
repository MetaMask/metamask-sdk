export type RpcMethod<Params, Return> = (
  params: Params,
) => Promise<Return> | Return;
