import { Duplex } from 'readable-stream';
import { SDKProvider } from '../provider/SDKProvider';
export interface EthereumProps {
    shouldSetOnWindow: boolean;
    connectionStream: Duplex;
    shouldSendMetadata?: boolean;
    shouldShimWeb3: boolean;
}
export declare class Ethereum {
    private static instance?;
    private provider;
    private constructor();
    /**
     * Factory method to initialize an Ethereum service.
     *
     * @param props
     */
    static init(props: EthereumProps): SDKProvider;
    static destroy(): void;
    static getInstance(): Ethereum;
    static getProvider(): SDKProvider;
}
//# sourceMappingURL=Ethereum.d.ts.map