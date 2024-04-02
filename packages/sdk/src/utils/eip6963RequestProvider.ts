import { MetaMaskInpageProvider } from '@metamask/providers';
import { METAMASK_EIP_6369_PROVIDER_INFO, UUID_V4_REGEX } from '../constants';
import { SDKProvider } from '../provider/SDKProvider';

export enum EIP6963EventNames {
  Announce = 'eip6963:announceProvider',
  Request = 'eip6963:requestProvider', // eslint-disable-line @typescript-eslint/no-shadow
}

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: SDKProvider;
}

export type EIP6963AnnounceProviderEvent = CustomEvent & {
  type: EIP6963EventNames.Announce;
  detail: EIP6963ProviderDetail;
};

export function eip6963RequestProvider(): Promise<MetaMaskInpageProvider> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('eip6963RequestProvider timed out'));
    }, 500);

    window.addEventListener(
      EIP6963EventNames.Announce,
      (eip6963AnnounceProviderEvent) => {
        const event =
          eip6963AnnounceProviderEvent as EIP6963AnnounceProviderEvent;

        const { detail: { info, provider } = {} } = event;

        const { name, rdns, uuid } = info ?? {};

        const isValid =
          UUID_V4_REGEX.test(uuid) &&
          (name as string).startsWith(METAMASK_EIP_6369_PROVIDER_INFO.NAME) &&
          rdns === METAMASK_EIP_6369_PROVIDER_INFO.RDNS;

        if (isValid) {
          clearTimeout(timeoutId);

          resolve(provider);
        }
      },
    );

    window.dispatchEvent(new Event(EIP6963EventNames.Request));
  });
}
