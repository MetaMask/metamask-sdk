import { EventEmitter2 } from 'eventemitter2';

type SDKEvents = {
  initialized: [
    evt: {
      chainId: string;
      isConnected: boolean;
      isMetaMask: boolean;
      selectedAddress: string | null | undefined;
      networkVersion: string | null | undefined;
    },
  ];
  display_uri: [evt: string];
  provider_update: [evt: 'terminate' | 'extension' | 'initialized'];
  connection_status: [
    // TODO: figure our something better than unknown
    evt: unknown,
  ];
  service_status: [
    // TODO: figure our something better than unknown
    evt: unknown,
  ];
  connect_with_Response: [
    // TODO: figure our something better than unknown
    evt: unknown,
  ];
};

type ExtensionEvents = {
  chainChanged: [evt: unknown];
  accountsChanged: [evt: unknown];
  disconnect: [evt: unknown];
  connect: [evt: unknown];
  connected: [evt: unknown];
};

export class EventEmitter<
  TEvents extends Record<string, unknown[]> = SDKEvents | ExtensionEvents,
> {
  readonly #emitter = new EventEmitter2();

  emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    ...eventArg: TEvents[TEventName]
  ) {
    this.#emitter.emit(eventName, ...eventArg);
  }

  on<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void,
  ) {
    this.#emitter.on(eventName, handler);
  }

  setMaxListeners(maxListeners: number) {
    this.#emitter.setMaxListeners(maxListeners);
  }

  off<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void,
  ) {
    this.#emitter.off(eventName, handler);
  }
}
