import { MetaMaskSDK } from '../../../sdk';
/**
 * Handles automatic and extension-based connections for MetaMask SDK.
 *
 * This function decides between connecting using MetaMask extension or automatically
 * connecting based on the passed parameters and platform conditions. If 'preferExtension' is true,
 * it attempts to connect with the MetaMask extension and falls back to cleaning the preference
 * if the connection fails. If 'checkInstallationImmediately' is set in options, it attempts to auto-connect,
 * but only if the platform is a desktop web environment.
 *
 * @param instance The MetaMaskSDK instance to handle the connection for.
 * @param preferExtension A boolean flag indicating whether to prefer connecting via MetaMask extension.
 * @returns void
 */
export declare function handleAutoAndExtensionConnections(instance: MetaMaskSDK, preferExtension: boolean): Promise<void>;
//# sourceMappingURL=handleAutoAndExtensionConnections.d.ts.map