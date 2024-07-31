import { ChannelConfig, DisconnectOptions, RemoteCommunication } from '@metamask/sdk-communication-layer';
export interface ProviderService {
    startConnection(): Promise<void>;
    isConnected(): boolean;
    isAuthorized(): boolean;
    getConnector(): RemoteCommunication | unknown;
    getUniversalLink(): string;
    getChannelConfig(): ChannelConfig | undefined;
    disconnect(options?: DisconnectOptions): void;
}
//# sourceMappingURL=ProviderService.d.ts.map