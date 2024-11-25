import { MetaMaskSDK } from '../../../sdk';
/**
 * Initializes event listeners for MetaMask SDK's remote connection.
 *
 * This function attaches listeners for CONNECTION_STATUS and SERVICE_STATUS events
 * on the remote connection's connector. These events are then emitted on the instance
 * itself, effectively propagating these events to whoever is using the instance.
 *
 * @param instance The MetaMaskSDK instance for which event listeners are being initialized.
 * @returns void
 */
export declare function initEventListeners(instance: MetaMaskSDK): void;
//# sourceMappingURL=initEventListeners.d.ts.map