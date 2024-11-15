import { MetaMaskSDK } from '../../../sdk';
/**
 * Connects the MetaMaskSDK instance to the MetaMask browser extension as the active provider.
 *
 * This function swaps the current active provider of the SDK with the MetaMask browser extension and sets it
 * as the default Ethereum provider in the window object. It then attempts to initialize a connection with
 * the extension by requesting access to the user's accounts.
 *
 * If successful, the function updates the local storage to remember this preference for future sessions. An event
 * and an analytics event are also emitted to indicate that the active provider has been updated to the extension.
 *
 * @param instance The current instance of the MetaMaskSDK, which contains user-defined or default options.
 * @returns {Promise<void>} A Promise that resolves when the connection has been established or an error has been caught.
 */
export declare function connectWithExtensionProvider(instance: MetaMaskSDK): Promise<void>;
//# sourceMappingURL=connectWithExtensionProvider.d.ts.map