import { MetaMaskConnector as DefaultMetaMaskConnector } from 'wagmi/connectors/metaMask';
import MetaMaskSDK, { MetaMaskSDKOptions as MetaMaskSDKOptionsProps } from '@metamask/sdk';
import { Chain } from 'wagmi';
declare type Options = {
    chains?: Chain[];
    MetaMaskSDKOptions?: MetaMaskSDKOptionsProps;
};
declare class MetaMaskConnector extends DefaultMetaMaskConnector {
    #private;
    sdk: MetaMaskSDK;
    constructor({ MetaMaskSDKOptions, chains }: Options);
    getProvider(): Promise<any>;
    getProviderSync(): any;
}
export default MetaMaskConnector;
