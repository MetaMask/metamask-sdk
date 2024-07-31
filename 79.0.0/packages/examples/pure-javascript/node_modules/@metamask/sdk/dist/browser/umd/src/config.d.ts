export declare const RPC_METHODS: {
    METAMASK_GETPROVIDERSTATE: string;
    METAMASK_CONNECTSIGN: string;
    METAMASK_CONNECTWITH: string;
    METAMASK_OPEN: string;
    METAMASK_BATCH: string;
    PERSONAL_SIGN: string;
    WALLET_REQUESTPERMISSIONS: string;
    WALLET_REVOKEPERMISSIONS: string;
    WALLET_GETPERMISSIONS: string;
    WALLET_WATCHASSET: string;
    WALLET_ADDETHEREUMCHAIN: string;
    WALLET_SWITCHETHETHEREUMCHAIN: string;
    ETH_REQUESTACCOUNTS: string;
    ETH_ACCOUNTS: string;
    ETH_CHAINID: string;
    ETH_SENDTRANSACTION: string;
    ETH_SIGNTYPEDDATA: string;
    ETH_SIGNTYPEDDATA_V3: string;
    ETH_SIGNTYPEDDATA_V4: string;
    ETH_SIGNTRANSACTION: string;
    ETH_SIGN: string;
    PERSONAL_EC_RECOVER: string;
};
export declare const METHODS_TO_REDIRECT: {
    [method: string]: boolean;
};
export declare const lcAnalyticsRPCs: string[];
export declare const rpcWithAccountParam: string[];
export declare const STORAGE_PATH = ".sdk-comm";
export declare const STORAGE_PROVIDER_TYPE = "providerType";
export declare const STORAGE_DAPP_SELECTED_ADDRESS = ".MMSDK_cached_address";
export declare const STORAGE_DAPP_CHAINID = ".MMSDK_cached_chainId";
export declare const EXTENSION_EVENTS: {
    CHAIN_CHANGED: string;
    ACCOUNTS_CHANGED: string;
    DISCONNECT: string;
    CONNECT: string;
    CONNECTED: string;
};
//# sourceMappingURL=config.d.ts.map