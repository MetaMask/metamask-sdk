import type { Transport, TransportRequest, TransportResponse } from '@metamask/multichain-api-client';

/**
 * Wrapper for the integration with the Mobile Wallet Protocol and the Dapp Client
 */
export const MWPClientTransport: Transport = {
	connect: () => Promise.resolve(),
	disconnect: () => Promise.resolve(),
	isConnected: () => true,
	request: <TRequest extends TransportRequest, TResponse extends TransportResponse>(_request: TRequest) => Promise.resolve({} as TResponse),
	onNotification: (_callback: (data: unknown) => void) => () => {},
};
