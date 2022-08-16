import { MetaMaskConnector as DefaultMetaMaskConnector } from 'wagmi/connectors/metaMask';
declare class MetaMaskConnector extends DefaultMetaMaskConnector {
    #private;
    getProvider(): Promise<any>;
    getProviderSync(): any;
}
export default MetaMaskConnector;
