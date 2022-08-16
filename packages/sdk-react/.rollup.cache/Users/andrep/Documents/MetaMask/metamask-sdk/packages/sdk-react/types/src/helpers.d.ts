declare type ErrorWithMessage = {
    message: string;
    code?: number;
};
export declare function toErrorWithMessage(maybeError: unknown): ErrorWithMessage;
export declare const getShortenedAddress: (address: string) => string;
export declare const hexaToEth: (hexString: string) => number;
/**
 * If the window object exists, and the ethereum object exists, and the isMetaMask function exists,
 * then return true.
 * @returns A boolean value.
 */
export declare const detectMetamask: () => boolean;
export declare const isChainId: (chainId: number) => chainId is 0 | 1 | 2 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 19 | 20 | 25 | 30 | 40 | 50 | 52 | 55 | 56 | 57 | 60 | 61 | 66 | 70 | 82 | 87 | 88 | 100 | 106 | 108 | 122 | 128 | 137 | 200 | 246 | 250 | 269 | 288 | 321 | 336 | 361 | 416 | 534 | 592 | 820 | 888 | 1088 | 1246 | 1284 | 1285 | 2020 | 2222 | 2612 | 4181 | 4689 | 5050 | 5551 | 7777 | 8217 | 9001 | 10000 | 103090 | 32659 | 42161 | 42220 | 42262 | 43114 | 71402 | 200625 | 333999 | 1313161554 | 1666600000 | 11297108109 | 836542336838601;
/**
 * It takes a chain ID and returns the name of the chain
 * @param {"string" | "number"} chain - The chain ID of the network you want to connect to.
 * @returns A string
 */
export declare const parseChainName: (chain: string | number) => string;
export declare const parseChainId: (chain: string | number) => number;
export {};
