import { MetaMaskSDK } from '../../../sdk';
/**
 * Asynchronously connects to MetaMask, requests account access and sign message.
 *
 * This function first checks whether the MetaMaskSDK instance is initialized.
 * If not, it initializes the instance. It then makes a request to access accounts
 * and the sign the message with the first account.
 *
 * @param instance The MetaMaskSDK instance to connect to.
 * @returns Promise resolving to the result of personal_sign on the msg.
 * @throws Error if the activeProvider is undefined.
 */
export declare function connectAndSign({ instance, msg, }: {
    instance: MetaMaskSDK;
    msg: string;
}): Promise<import("@metamask/providers/dist/types/utils").Maybe<unknown>>;
//# sourceMappingURL=connectAndSign.d.ts.map