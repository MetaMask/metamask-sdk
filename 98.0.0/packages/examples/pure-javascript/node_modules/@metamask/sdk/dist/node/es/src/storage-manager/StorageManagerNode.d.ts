import { ChannelConfig, StorageManager, StorageManagerProps } from '@metamask/sdk-communication-layer';
export declare class StorageManagerNode implements StorageManager {
    private enabled;
    constructor({ enabled }?: StorageManagerProps | undefined);
    persistChannelConfig(channelConfig: ChannelConfig): Promise<void>;
    persistAccounts(accounts: string[]): Promise<void>;
    getCachedAccounts(): Promise<string[]>;
    persistChainId(chainId: string): Promise<void>;
    getCachedChainId(): Promise<string | undefined>;
    getPersistedChannelConfig(): Promise<ChannelConfig | undefined>;
    terminate(): Promise<void>;
}
//# sourceMappingURL=StorageManagerNode.d.ts.map