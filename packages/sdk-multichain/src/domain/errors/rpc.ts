import { BaseErr } from "./base";
import type { RPCErrorCodes } from "./types";

export class RPCHttpErr extends BaseErr<"RPC", RPCErrorCodes> {
	static readonly code = 50;
	constructor(
		readonly rpcEndpoint: string,
		readonly method: string,
		readonly httpStatus: number,
	) {
		super(`RPCErr${RPCHttpErr.code}: ${httpStatus} on ${rpcEndpoint} for method ${method}`, RPCHttpErr.code);
	}
}

export class RPCReadonlyResponseErr extends BaseErr<"RPC", RPCErrorCodes> {
	static readonly code = 51;
	constructor(public readonly reason: string) {
		super(`RPCErr${RPCReadonlyResponseErr.code}: RPC Client response reason ${reason}`, RPCReadonlyResponseErr.code);
	}
}

export class RPCReadonlyRequestErr extends BaseErr<"RPC", RPCErrorCodes> {
	static readonly code = 52;
	constructor(public readonly reason: string) {
		super(`RPCErr${RPCReadonlyRequestErr.code}: RPC Client fetch reason ${reason}`, RPCReadonlyRequestErr.code);
	}
}

export class RPCInvokeMethodErr extends BaseErr<"RPC", RPCErrorCodes> {
	static readonly code = 53;
	constructor(public readonly reason: string) {
		super(`RPCErr${RPCInvokeMethodErr.code}: RPC Client invoke method reason ${reason}`, RPCInvokeMethodErr.code);
	}
}
