export type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>;

export type ErrorCodeRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

export type DomainErrorCodes = ErrorCodeRange<1, 50>;
export type RPCErrorCodes = ErrorCodeRange<50, 60>;
export type StorageErrorCodes = ErrorCodeRange<60, 70>;

export type ErrorCodes = DomainErrorCodes | RPCErrorCodes | StorageErrorCodes;
