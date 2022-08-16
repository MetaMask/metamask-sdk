import { Chain } from 'wagmi';
export * from 'wagmi';
export declare const useConnect: () => {
    readonly connect: (args?: Partial<import("@wagmi/core").ConnectArgs> | undefined) => void;
    readonly connectAsync: (args?: Partial<import("@wagmi/core").ConnectArgs> | undefined) => Promise<import("@wagmi/core").ConnectResult<import("@wagmi/core").Provider>>;
    readonly connectors: import("wagmi").Connector<any, any, any>[];
    readonly data: import("@wagmi/core").ConnectResult<import("@wagmi/core").Provider> | undefined;
    readonly error: Error | null;
    readonly isError: boolean;
    readonly isIdle: boolean;
    readonly isLoading: boolean;
    readonly isSuccess: boolean;
    readonly pendingConnector: import("wagmi").Connector<any, any, any> | undefined;
    readonly reset: () => void;
    readonly status: "loading" | "error" | "idle" | "success";
    readonly variables: import("@wagmi/core").ConnectArgs | undefined;
};
export declare const useSwitchOrAddNetwork: () => {
    chains: Chain[];
    error: undefined;
    isLoading: boolean | undefined;
    pendingChainId: number | undefined;
    switchOrAddNetwork: (chain: Chain) => Promise<any>;
};
