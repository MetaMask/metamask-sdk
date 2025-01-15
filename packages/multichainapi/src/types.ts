// packages/multichainapi/src/types.ts
export interface SessionData {
  id: string;
  chainId: string;
  account: string;
  expiry: number;
}

export interface MethodParams {
  chainId: string;
  method: string;
  params: unknown[];
}

export interface SessionEventData {
  type: 'created' | 'updated' | 'revoked';
  session: SessionData;
}
