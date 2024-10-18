import { SDKProvider } from '../../../provider/SDKProvider';
type InitializeStateArgs = Parameters<SDKProvider['_initializeState']>[0];
/**
 * Initializes the state of an SDKProvider instance.
 *
 * This function is responsible for setting the initial state of an SDKProvider instance.
 * If debug mode is enabled, it logs the process to the console. It sets the `_state.initialized`
 * property to false, thereby forcing re-initialization without error.
 *
 * @param instance The SDKProvider instance whose state is to be initialized.
 * @param superInitializeState A function responsible for performing the actual state initialization.
 * @param initialState An optional initial state object to be passed to `superInitializeState`.
 * @returns void
 */
export declare function initializeState(instance: SDKProvider, superInitializeState: (initialState: InitializeStateArgs) => void, initialState?: InitializeStateArgs | undefined): void;
export {};
//# sourceMappingURL=initializeState.d.ts.map