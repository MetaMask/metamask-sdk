/// <reference types="node" />
import PublicKey from "./PublicKey";
export default class PrivateKey {
    static fromHex(hex: string): PrivateKey;
    readonly secret: Buffer;
    readonly publicKey: PublicKey;
    constructor(secret?: Buffer);
    toHex(): string;
    encapsulate(pub: PublicKey): Buffer;
    multiply(pub: PublicKey): Buffer;
    equals(other: PrivateKey): boolean;
}
