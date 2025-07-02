import { EventEmitter2 } from 'eventemitter2';
import { EventTypes } from './types';




export class EventEmitter<
  TEvents extends Record<string, unknown[]> = EventTypes,
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
