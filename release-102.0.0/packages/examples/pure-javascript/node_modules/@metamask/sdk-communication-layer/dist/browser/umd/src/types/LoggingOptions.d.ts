export interface CommunicationLayerLoggingOptions {
    eciesLayer?: boolean;
    keyExchangeLayer?: boolean;
    serviceLayer?: boolean;
    remoteLayer?: boolean;
    plaintext?: boolean;
    logger?: (_msg: string, ...args: unknown[]) => void;
}
//# sourceMappingURL=LoggingOptions.d.ts.map