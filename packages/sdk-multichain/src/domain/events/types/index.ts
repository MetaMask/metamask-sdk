import type { SessionData } from '@metamask/multichain-api-client';

export type SDKEvents = {
	display_uri: [evt: string];
	wallet_sessionChanged: [evt: SessionData | undefined];
	[key: string]: [evt: unknown];
};

export type EventTypes = SDKEvents;
