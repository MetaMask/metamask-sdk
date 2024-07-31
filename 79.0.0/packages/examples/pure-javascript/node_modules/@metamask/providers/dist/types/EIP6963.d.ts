import type { BaseProvider } from './BaseProvider';
/**
 * Describes the possible EIP-6963 event names
 */
declare enum EIP6963EventNames {
    Announce = "eip6963:announceProvider",
    Request = "eip6963:requestProvider"
}
declare global {
    interface WindowEventMap {
        [EIP6963EventNames.Request]: EIP6963RequestProviderEvent;
        [EIP6963EventNames.Announce]: EIP6963AnnounceProviderEvent;
    }
}
/**
 * Represents the assets needed to display and identify a wallet.
 *
 * @type EIP6963ProviderInfo
 * @property uuid - A locally unique identifier for the wallet. MUST be a v4 UUID.
 * @property name - The name of the wallet.
 * @property icon - The icon for the wallet. MUST be data URI.
 * @property rdns - The reverse syntax domain name identifier for the wallet.
 */
export declare type EIP6963ProviderInfo = {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
};
/**
 * Represents a provider and the information relevant for the dapp.
 *
 * @type EIP6963ProviderDetail
 * @property info - The EIP6963ProviderInfo object.
 * @property provider - The provider instance.
 */
export declare type EIP6963ProviderDetail = {
    info: EIP6963ProviderInfo;
    provider: BaseProvider;
};
/**
 * Event for requesting an EVM provider.
 *
 * @type EIP6963RequestProviderEvent
 * @property type - The name of the event.
 */
export declare type EIP6963RequestProviderEvent = Event & {
    type: EIP6963EventNames.Request;
};
/**
 * Event for announcing an EVM provider.
 *
 * @type EIP6963RequestProviderEvent
 * @property type - The name of the event.
 * @property detail - The detail object of the event.
 */
export declare type EIP6963AnnounceProviderEvent = CustomEvent & {
    type: EIP6963EventNames.Announce;
    detail: EIP6963ProviderDetail;
};
/**
 * Intended to be used by a dapp. Forwards every announced provider to the
 * provided handler by listening for * {@link EIP6963AnnounceProviderEvent},
 * and dispatches an {@link EIP6963RequestProviderEvent}.
 *
 * @param handleProvider - A function that handles an announced provider.
 */
export declare function requestProvider<HandlerReturnType>(handleProvider: (providerDetail: EIP6963ProviderDetail) => HandlerReturnType): void;
/**
 * Intended to be used by a wallet. Announces a provider by dispatching
 * an {@link EIP6963AnnounceProviderEvent}, and listening for
 * {@link EIP6963RequestProviderEvent} to re-announce.
 *
 * @throws If the {@link EIP6963ProviderDetail} is invalid.
 * @param providerDetail - The {@link EIP6963ProviderDetail} to announce.
 * @param providerDetail.info - The {@link EIP6963ProviderInfo} to announce.
 * @param providerDetail.provider - The provider to announce.
 */
export declare function announceProvider(providerDetail: EIP6963ProviderDetail): void;
export {};
//# sourceMappingURL=EIP6963.d.ts.map