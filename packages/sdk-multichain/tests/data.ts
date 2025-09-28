import { SessionRequest } from "@metamask/mobile-wallet-protocol-core";
import { SessionData } from "@metamask/multichain-api-client";





// Mock session data for testing
export const mockSessionData: SessionData = {
	sessionScopes: {
		'eip155:1': {
			accounts: ['eip155:1:0x1234567890abcdef1234567890abcdef12345678'],
			methods: [],
			notifications: [],
		},
	},
	expiry: new Date(Date.now() + 3600000).toISOString(),
};

export const mockSessionRequestData: SessionRequest = {
	id: '1',
	mode: 'trusted',
	channel: 'eip155:1',
	publicKeyB64: '1234567890',
	expiresAt: new Date(Date.now() + 3600000).getTime(),
};
