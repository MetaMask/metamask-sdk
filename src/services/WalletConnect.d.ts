import WC from '@walletconnect/client';
declare const WalletConnect: {
    connector: WC;
    forceRestart: boolean;
    isConnected(): boolean;
    isDesktop: boolean;
    sentFirstConnect: boolean;
    startConnection(): Promise<unknown>;
};
export default WalletConnect;
