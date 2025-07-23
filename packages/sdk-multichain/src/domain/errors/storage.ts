import { BaseErr } from './base';
import type { StorageErrorCodes } from './types';

export class StorageGetErr extends BaseErr<'Storage', StorageErrorCodes> {
  static readonly code = 60;
  constructor(
    public readonly platform: 'web' | 'rn' | 'node',
    public readonly key: string,
    public readonly reason: string,
  ) {
    super(`StorageErr${StorageGetErr.code}: ${platform} storage get error in key: ${key} - ${reason}`, StorageGetErr.code);
  }
}

export class StorageSetErr extends BaseErr<'Storage', StorageErrorCodes> {
  static readonly code = 61;
  constructor(
    public readonly platform: 'web' | 'rn' | 'node',
    public readonly key: string,
    public readonly reason: string,
  ) {
    super(`StorageErr${StorageSetErr.code}: ${platform} storage set error in key: ${key} - ${reason}`, StorageSetErr.code);
  }
}

export class StorageDeleteErr extends BaseErr<'Storage', StorageErrorCodes> {
  static readonly code = 62;
  constructor(
    public readonly platform: 'web' | 'rn' | 'node',
    public readonly key: string,
    public readonly reason: string,
  ) {
    super(`StorageErr${StorageDeleteErr.code}: ${platform} storage delete error in key: ${key} - ${reason}`, StorageDeleteErr.code);
  }
}
