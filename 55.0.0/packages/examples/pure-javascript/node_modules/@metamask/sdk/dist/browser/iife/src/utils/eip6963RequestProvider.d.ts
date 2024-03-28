import { MetaMaskInpageProvider } from '@metamask/providers';
import { SDKProvider } from '../provider/SDKProvider';
export declare enum EIP6963EventNames {
    Announce = "eip6963:announceProvider",
    Request = "eip6963:requestProvider"
}
export interface EIP6963ProviderInfo {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
}
export interface EIP6963ProviderDetail {
    info: EIP6963ProviderInfo;
    provider: SDKProvider;
}
export type EIP6963AnnounceProviderEvent = CustomEvent & {
    type: EIP6963EventNames.Announce;
    detail: EIP6963ProviderDetail;
};
export declare function eip6963RequestProvider(): Promise<MetaMaskInpageProvider>;
//# sourceMappingURL=eip6963RequestProvider.d.ts.map