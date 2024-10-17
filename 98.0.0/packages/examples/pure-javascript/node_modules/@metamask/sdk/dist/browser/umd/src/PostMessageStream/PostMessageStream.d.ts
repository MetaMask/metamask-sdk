/// <reference types="node" />
import { Duplex } from 'readable-stream';
export interface PostMessageStream extends Duplex {
    _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void;
    start(): void;
}
//# sourceMappingURL=PostMessageStream.d.ts.map