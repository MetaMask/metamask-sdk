export interface ChannelConfig {
    channelId: string;
    validUntil: number;
    otherKey?: string;
    localKey?: string;
    relayPersistence?: boolean;
    /**
     * lastActive: ms value of the last time connection was ready CLIENTS_READY event.
     * */
    lastActive?: number;
}
//# sourceMappingURL=ChannelConfig.d.ts.map