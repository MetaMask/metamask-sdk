import { CaipChainId } from '@metamask/utils';
import { Json } from '@metamask/utils';
import { FEATURED_NETWORKS } from '@metamask/multichainapi';

export type NetworkId = keyof typeof FEATURED_NETWORKS;

export interface WalletHistoryEntry {
  timestamp: number;
  data: unknown;
}

export interface SessionMethodResult {
  timestamp: number;
  method: string;
  data: unknown;
}

export interface InvokeMethodResult {
  result: Json;
  request: Json;
}

export interface InvokeMethodRequest {
  method: string;
  params: {
    scope: CaipChainId;
    request: {
      method: string;
      params: Json[];
    };
  };
}

export interface ScopeMethodResults {
  [method: string]: InvokeMethodResult[];
}

export interface InvokeMethodResults {
  [scope: string]: ScopeMethodResults;
}
