import { MetaMaskSDK } from '../../sdk';
interface DappIdentifier {
    url: string;
    name: string;
}
/**
 * Retrieves or generates a unique identifier for a dapp based on its metadata,
 * and determines the platform type from which the request is originating.
 *
 * @param {SDKInstance} sdkInstance - The SDK instance containing metadata and platform manager information.
 *
 * The `sdkInstance` parameter should have the following structure:
 * - `dappMetadata` (optional): An object containing metadata about the dapp.
 *   - `url`: The URL of the dapp (e.g., 'https://example.com').
 *   - `name`: The name of the dapp (e.g., 'Example Dapp').
 * - `platformManager` (optional): An object responsible for managing platform-specific details.
 *   - `getPlatformType`: A function that returns the platform type, typically an enum like `PlatformType.DesktopWeb` or `PlatformType.MetaMaskMobileWebview`.
 *
 * @returns {{ id: string, from: string }} - An object containing the following properties:
 * - `id`: A unique identifier (UUID) for the dapp, generated based on the dapp's URL and name.
 * - `from`: A string indicating the platform type from which the request originates:
 *   - `'extension'` if the platform type is `DesktopWeb`.
 *   - `'mobile'` if the platform type is `MetaMaskMobileWebview`.
 *   - `'N/A'` if the platform type is neither of the above or undefined.
 */
declare function getPlatformDetails(sdkInstance: MetaMaskSDK): {
    id: string;
    from: string;
};
/**
 * Gets or creates a unique identifier (UUID) based on the provided url and name.
 * The identifier is stored in localStorage using a Base64 encoded combination of `url` and `name`.
 *
 * @param {DappIdentifier} identifier - An object containing the `url` and `name` of the dapp.
 * @returns {string} - The unique identifier (UUID) for the dapp.
 */
declare function getOrCreateUuidForIdentifier({ url, name }: DappIdentifier): string;
export { getOrCreateUuidForIdentifier, getPlatformDetails };
//# sourceMappingURL=handleUuid.d.ts.map