import { MetaMaskSDK } from '../../../sdk';
/**
 * Terminates the MetaMask connection, switching back to the injected provider if connected via extension.
 *
 * This function first checks if the SDK is running within MetaMask Mobile WebView; if it is,
 * no termination is performed. If connected via extension, it removes the active extension provider
 * and switches back to the SDK's default provider. Finally, it emits a PROVIDER_UPDATE event of type TERMINATE.
 *
 * @param instance The MetaMaskSDK instance whose connection should be terminated.
 * @returns void
 * @emits EventType.PROVIDER_UPDATE with payload PROVIDER_UPDATE_TYPE.TERMINATE when the provider is updated.
 */
export declare function terminate(instance: MetaMaskSDK): Promise<void>;
//# sourceMappingURL=terminate.d.ts.map