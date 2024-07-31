/// <reference types="node" />
import PrivateKey from "./PrivateKey";
export default class PublicKey {
    static fromHex(hex: string): PublicKey;
    readonly uncompressed: Buffer;
    readonly compressed: Buffer;
    constructor(buffer: Buffer);
    toHex(compressed?: boolean): string;
    decapsulate(priv: PrivateKey): Buffer;
    equals(other: PublicKey): boolean;
}
