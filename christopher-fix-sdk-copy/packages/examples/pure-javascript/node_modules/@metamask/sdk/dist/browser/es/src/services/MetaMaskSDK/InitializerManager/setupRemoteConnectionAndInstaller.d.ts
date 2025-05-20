import { MetaMaskSDK } from '../../../sdk';
/**
 * Initializes and sets up both the RemoteConnection and MetaMaskInstaller for the MetaMaskSDK instance.
 *
 * This function constructs a new RemoteConnection with various settings, such as communication layer preference,
 * analytics, and metadata based on the provided options within the MetaMaskSDK instance. It also sets up
 * MetaMaskInstaller which is responsible for handling MetaMask installations. The initialized RemoteConnection
 * and MetaMaskInstaller are stored back into the MetaMaskSDK instance for further use.
 *
 * @param instance The current instance of the MetaMaskSDK, which contains user-defined or default options.
 * @param metamaskBrowserExtension An optional parameter representing the MetaMask browser extension instance, if available.
 * @returns {Promise<void>} A Promise that resolves when both the RemoteConnection and MetaMaskInstaller have been successfully set up.
 */
export declare function setupRemoteConnectionAndInstaller(instance: MetaMaskSDK, metamaskBrowserExtension: any): Promise<void>;
//# sourceMappingURL=setupRemoteConnectionAndInstaller.d.ts.map