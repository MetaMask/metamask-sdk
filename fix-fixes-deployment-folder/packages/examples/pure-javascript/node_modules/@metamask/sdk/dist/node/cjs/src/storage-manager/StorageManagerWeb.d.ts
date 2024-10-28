import { ChannelConfig, StorageManager, StorageManagerProps } from '@metamask/sdk-communication-layer';
export declare class StorageManagerWeb implements StorageManager {
    private enabled;
    constructor({ enabled }?: StorageManagerProps | undefined);
    persistChannelConfig(channelConfig: ChannelConfig): Promise<void>;
    getPersistedChannelConfig(): Promise<ChannelConfig | undefined>;
    persistAccounts(accounts: string[]): Promise<void>;
    getCachedAccounts(): Promise<string[]>;
    persistChainId(chainId: string): Promise<void>;
    getCachedChainId(): Promise<string | undefined>;
    terminate(): Promise<void>;
}
//# sourceMappingURL=StorageManagerWeb.d.ts.map