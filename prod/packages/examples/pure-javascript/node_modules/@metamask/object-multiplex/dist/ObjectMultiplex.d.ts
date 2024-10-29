/// <reference types="node" />
import { Duplex } from 'readable-stream';
import { Substream } from './Substream';
interface Chunk {
    name: string;
    data: unknown;
}
export declare class ObjectMultiplex extends Duplex {
    private _substreams;
    constructor(opts?: Record<string, unknown>);
    createStream(name: string): Substream;
    ignoreStream(name: string): void;
    _read(): void;
    _write(chunk: Chunk, _encoding: BufferEncoding, callback: (error?: Error | null) => void): void;
}
export {};
