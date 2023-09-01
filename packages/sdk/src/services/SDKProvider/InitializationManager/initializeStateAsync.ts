import { BaseProvider } from '@metamask/providers';
import { SDKProvider } from '../../../provider/SDKProvider';

export async function initializeStateAsync(instance: SDKProvider) {
  if (instance.debug) {
    console.debug(`SDKProvider::_initializeStateAsync()`);
  }

  if (instance.providerStateRequested) {
    if (instance.debug) {
      console.debug(
        `SDKProvider::_initializeStateAsync() initialization already in progress`,
      );
    }
  } else {
    instance.providerStateRequested = true;
    // Replace super.initialState logic to automatically request account if not found in providerstate.
    let initialState: Parameters<BaseProvider['_initializeState']>[0];
    try {
      initialState = (await instance.request({
        method: 'metamask_getProviderState',
      })) as Parameters<BaseProvider['_initializeState']>[0];
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      instance._log.error(
        'MetaMask: Failed to get initial state. Please report this bug.',
        error,
      );
      instance.providerStateRequested = false;
      return;
    }

    if (instance.debug) {
      console.debug(
        `SDKProvider::_initializeStateAsync state selectedAddress=${instance.selectedAddress} `,
        initialState,
      );
    }

    if (initialState?.accounts?.length === 0) {
      if (instance.debug) {
        console.debug(
          `SDKProvider::_initializeStateAsync initial state doesn't contain accounts`,
        );
      }

      if (instance.selectedAddress) {
        if (instance.debug) {
          console.debug(
            `SDKProvider::_initializeStateAsync using instance.selectedAddress instead`,
          );
        }

        initialState.accounts = [instance.selectedAddress];
      } else {
        if (instance.debug) {
          console.debug(
            `SDKProvider::_initializeStateAsync Fetch accounts remotely.`,
          );
        }

        const accounts = (await instance.request({
          method: 'eth_requestAccounts',
          params: [],
        })) as string[];
        initialState.accounts = accounts;
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    instance._initializeState(initialState);
    instance.providerStateRequested = false;
  }
}
