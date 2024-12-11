import { ConnectionStatus, ServiceStatus } from '@metamask/sdk-communication-layer';
import { PROVIDER_UPDATE_TYPE } from './ProviderUpdateType';
export declare const MetaMaskSDKEvent: {
    readonly Initialized: "initialized";
    readonly DisplayURI: "display_uri";
    readonly ProviderUpdate: "provider_update";
    readonly ConnectWithResponse: "connectWithResponse";
    readonly ConnectionStatus: "connection_status";
    readonly ServiceStatus: "service_status";
};
export type MetaMaskSDKEventType = (typeof MetaMaskSDKEvent)[keyof typeof MetaMaskSDKEvent];
export interface MetaMaskSDKEvents {
    [MetaMaskSDKEvent.Initialized]: {
        chainId: string;
        isConnected: boolean;
        isMetaMask: boolean;
        selectedAddress: string | null | undefined;
        networkVersion: string | null | undefined;
    };
    [MetaMaskSDKEvent.DisplayURI]: string;
    [MetaMaskSDKEvent.ProviderUpdate]: PROVIDER_UPDATE_TYPE;
    [MetaMaskSDKEvent.ConnectWithResponse]: unknown;
    [MetaMaskSDKEvent.ConnectionStatus]: ConnectionStatus;
    [MetaMaskSDKEvent.ServiceStatus]: ServiceStatus;
}
export type MetaMaskSDKEventPayload<T extends MetaMaskSDKEventType> = T extends keyof MetaMaskSDKEvents ? MetaMaskSDKEvents[T] : unknown;
//# sourceMappingURL=MetaMaskSDKEvents.d.ts.map