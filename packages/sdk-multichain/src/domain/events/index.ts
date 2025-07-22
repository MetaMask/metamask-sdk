import { EventEmitter2 } from "eventemitter2";

import type { EventTypes } from "./types";

/**
 * A type-safe event emitter that provides a strongly-typed wrapper around EventEmitter2.
 *
 * This class ensures type safety for event names and their corresponding argument types,
 * making it easier to work with events in a type-safe manner.
 *
 * @template TEvents - A record type mapping event names to their argument types.
 *                    Each key represents an event name, and the value is a tuple of argument types.
 */
export class EventEmitter<TEvents extends Record<string, unknown[]> = EventTypes> {
	readonly #emitter = new EventEmitter2();

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
	}

	/**
	 * Sets the maximum number of listeners that can be registered for any single event.
	 *
	 * This is useful for preventing memory leaks when many listeners are registered.
	 * By default, EventEmitter2 will warn if more than 10 listeners are registered
	 * for a single event.
	 *
	 * @param maxListeners - The maximum number of listeners per event (0 means unlimited)
	 */
	setMaxListeners(maxListeners: number) {
		this.#emitter.setMaxListeners(maxListeners);
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

export type * from "./types";
