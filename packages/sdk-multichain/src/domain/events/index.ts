import { EventEmitter as EventEmitter3 } from 'eventemitter3';

/**
 * A type-safe event emitter that provides a strongly-typed wrapper around EventEmitter2.
 *
 * This class ensures type safety for event names and their corresponding argument types,
 * making it easier to work with events in a type-safe manner.
 *
 * @template TEvents - A record type mapping event names to their argument types.
 *                    Each key represents an event name, and the value is a tuple of argument types.
 */
export class EventEmitter<TEvents extends Record<string, unknown[]>> {
	readonly #emitter = new EventEmitter3();

	/**
	 * Emits an event with the specified name and arguments.
	 *
	 * @template TEventName - The name of the event to emit (must be a key of TEvents)
	 * @param eventName - The name of the event to emit
	 * @param eventArg - The arguments to pass to the event handlers
	 */
	emit<TEventName extends keyof TEvents & string>(eventName: TEventName, ...eventArg: TEvents[TEventName]) {
		this.#emitter.emit(eventName, ...eventArg);
	}

	/**
	 * Registers an event handler for the specified event.
	 *
	 * @template TEventName - The name of the event to listen for (must be a key of TEvents)
	 * @param eventName - The name of the event to listen for
	 * @param handler - The function to call when the event is emitted
	 */
	on<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void) {
		this.#emitter.on(eventName, handler);
		return () => {
			this.off(eventName, handler);
		};
	}

	/**
	 * Removes a specific event handler for the specified event.
	 *
	 * @template TEventName - The name of the event to remove the handler from (must be a key of TEvents)
	 * @param eventName - The name of the event to remove the handler from
	 * @param handler - The specific handler function to remove
	 */
	off<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void) {
		this.#emitter.off(eventName, handler);
	}
}

export type * from './types';
