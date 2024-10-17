import { RPCMethodCache, RPCMethodResult, SocketService } from '../SocketService';
export declare const wait: (ms: number) => Promise<unknown>;
export declare const waitForRpc: (rpcId: string, rpc: RPCMethodCache, interval?: number) => Promise<RPCMethodResult>;
export declare const waitForNextRpcCall: ({ rpcId, instance, }: {
    rpcId: string;
    instance: SocketService;
}) => Promise<string>;
//# sourceMappingURL=wait.d.ts.map