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
  /** The core instance of the Multichain SDK */
  private core: MultichainCore;

  /** The currently selected chain ID on the wallet */
  public currentChainId?: number;

  constructor(core: MultichainCore) {
    super();
    this.core = core;
  }

  /**
   * Submits a request to the EIP-1193 provider
   * @param request - The request object containing the method and params
   */
  request(request: {
    method: string;
    params: unknown;
    chainId?: string;
  }): Promise<unknown> {
    const _chainId = request.chainId ?? this.currentChainId;

    // TODO (@wenfix): remap methods to wallet_createSession and wallet_getSession
    return this.core.invokeMethod({
      scope: `${EIP155}:${_chainId}`,
      request: {
        method: request.method,
        params: request.params,
      },
    });
  }
}
