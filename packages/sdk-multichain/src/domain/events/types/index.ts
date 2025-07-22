import type { SessionData } from "@metamask/multichain-api-client";

export type SDKEvents = {
	display_uri: [evt: string];
	sessionChanged: [evt: SessionData | undefined];
};

export type EventTypes = SDKEvents;
