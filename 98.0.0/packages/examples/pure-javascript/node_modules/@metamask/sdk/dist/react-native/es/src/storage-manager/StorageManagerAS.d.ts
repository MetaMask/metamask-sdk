import { ChannelConfig, StorageManager, StorageManagerProps } from '@metamask/sdk-communication-layer';
export declare class StorageManagerAS implements StorageManager {
    private enabled;
    constructor({ enabled }?: StorageManagerProps | undefined);
    persistChannelConfig(channelConfig: ChannelConfig, context?: string): Promise<void>;
    persistAccounts(accounts: string[], context?: string): Promise<void>;
    getCachedAccounts(): Promise<string[]>;
    getCachedChainId(): Promise<string | undefined>;
    persistChainId(chainId: string, context?: string): Promise<void>;
    getPersistedChannelConfig(options?: {
        context?: string;
    }): Promise<ChannelConfig | undefined>;
    terminate(): Promise<void>;
}
//# sourceMappingURL=StorageManagerAS.d.ts.map