import { SDKProvider } from '../../../provider/SDKProvider';

type InitializeStateArgs = Parameters<SDKProvider['_initializeState']>[0];

export function initializeState(
  instance: SDKProvider,
  superInitializeState: (initialState: InitializeStateArgs) => void,
  initialState?: InitializeStateArgs | undefined,
): void {
  if (instance.debug) {
    console.debug(
      `SDKProvider::_initializeState() set state._initialized to false`,
    );
  }

  // Force re-initialize without error.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  instance._state.initialized = false;
  return superInitializeState(initialState);
}
