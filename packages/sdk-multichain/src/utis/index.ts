import { v4 as uuidv4 } from 'uuid';


import type { StoreClient } from '../domain/store/client';
import packageJson from '../../package.json';
import type { DappSettings } from 'src/domain/multichain';

export function getVersion() {
  return packageJson.version;
}

export function getDappId(dapp?: DappSettings) {
  if (
    typeof window === 'undefined' ||
    typeof window.location === 'undefined'
  ) {
      return (
      dapp?.name ??
      dapp?.url ??
      'N/A'
    );
  }

  return window.location.hostname;
}

export async function getAnonId(storage: StoreClient) {
  const anonId = await storage.getAnonId();
  if (anonId) {
    return anonId;
  }
  const newAnonId = uuidv4();
  await storage.setAnonId(newAnonId);
  return newAnonId;
}
