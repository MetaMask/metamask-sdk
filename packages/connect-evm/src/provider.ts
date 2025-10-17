/* eslint-disable camelcase */
import { EventEmitter, MultichainCore } from '@metamask/multichain-sdk';

export const EIP155 = 'eip155';

type SDKEvents = {
  connect: [{ chainId: number }];
  disconnect: [];
  accountsChanged: [{ account: string }];
  chainChanged: [{ chainId: number }];
};

/**
 * Basic EIP-1193 Provider Implementation
 */
export class EIP1193Provider extends EventEmitter<SDKEvents> {
  private connectCore: MultichainCore;

  constructor(core: MultichainCore) {
    super();
    this.connectCore = core;
  }

  request(request: {
    method: string;
    params: unknown;
    chainId?: string;
  }): Promise<unknown> {
    return this.connectCore.invokeMethod({
      scope: `${EIP155}:${request.chainId}`,
      request: {
        method: request.method,
        params: request.params,
      },
    });
  }
}
