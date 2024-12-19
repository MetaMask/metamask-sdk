import { MetaMaskSDK } from '../../../sdk';
/**
 * Sets up the extension preferences for the MetaMask SDK instance.
 *
 * This function tries to identify if the MetaMask extension is installed and active in the browser.
 * If the extension is found, the relevant MetaMask SDK instance properties are updated accordingly.
 * The function also checks if the SDK is running in MetaMask's in-app browser on mobile devices.
 * Based on these checks, the function returns an object containing information about whether the
 * extension is preferred, whether the initialization process should return early, and the detected
 * MetaMask browser extension.
 *
 * @param {MetaMaskSDK} instance - The MetaMaskSDK instance for which extension preferences will be set up.
 * @returns {Object} An object containing the following properties:
 *   - preferExtension: Boolean indicating if the extension is preferred.
 *   - shouldReturn: Boolean indicating if the initialization process should return early.
 *   - metamaskBrowserExtension: The detected MetaMask browser extension, if any.
 * @async
 */
export declare function setupExtensionPreferences(instance: MetaMaskSDK): Promise<{
    preferExtension: boolean;
    shouldReturn: boolean;
    metamaskBrowserExtension: import("@metamask/providers").MetaMaskInpageProvider | undefined;
}>;
//# sourceMappingURL=setupExtensionPreferences.d.ts.map