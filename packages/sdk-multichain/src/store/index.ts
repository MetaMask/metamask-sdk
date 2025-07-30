import * as uuid from 'uuid';

import type { StoreAdapter, StoreClient, TransportType } from '../domain';
import { StorageDeleteErr, StorageGetErr, StorageSetErr } from '../domain/errors/storage';
import { getTransportType } from '../domain/multichain';

export class Store implements StoreClient {
	readonly #adapter: StoreAdapter;

	constructor(adapter: StoreAdapter) {
		this.#adapter = adapter;
	}

	async getTransport(): Promise<TransportType | null> {
		try {
			const transport = await this.#adapter.get('multichain-transport');
			if (!transport) {
				return null;
			}
			return getTransportType(transport);
		} catch (err) {
			throw new StorageGetErr(this.#adapter.platform, 'multichain-transport', err.message);
		}
	}

	async setTransport(transport: TransportType): Promise<void> {
		try {
			await this.#adapter.set('multichain-transport', transport);
		} catch (err) {
			throw new StorageSetErr(this.#adapter.platform, 'multichain-transport', err.message);
		}
	}

	async removeTransport(): Promise<void> {
		try {
			await this.#adapter.delete('multichain-transport');
		} catch (err) {
			throw new StorageDeleteErr(this.#adapter.platform, 'multichain-transport', err.message);
		}
	}

	async getAnonId(): Promise<string> {
		try {
			const anonId = await this.#adapter.get('anonId');
			if (anonId) {
				return anonId;
			}
			const newAnonId = uuid.v4();
			await this.#adapter.set('anonId', newAnonId);
			return newAnonId;
		} catch (err) {
			throw new StorageGetErr(this.#adapter.platform, 'anonId', err.message);
		}
	}

	async getExtensionId(): Promise<string | null> {
		try {
			return await this.#adapter.get('extensionId');
		} catch (err) {
			throw new StorageGetErr(this.#adapter.platform, 'extensionId', err.message);
		}
	}

	async setAnonId(anonId: string): Promise<void> {
		try {
			return await this.#adapter.set('anonId', anonId);
		} catch (err) {
			throw new StorageSetErr(this.#adapter.platform, 'anonId', err.message);
		}
	}

	async setExtensionId(extensionId: string): Promise<void> {
		try {
			return await this.#adapter.set('extensionId', extensionId);
		} catch (err) {
			throw new StorageSetErr(this.#adapter.platform, 'extensionId', err.message);
		}
	}

	async removeExtensionId(): Promise<void> {
		try {
			return await this.#adapter.delete('extensionId');
		} catch (err) {
			throw new StorageDeleteErr(this.#adapter.platform, 'extensionId', err.message);
		}
	}

	async removeAnonId(): Promise<void> {
		try {
			return await this.#adapter.delete('anonId');
		} catch (err) {
			throw new StorageDeleteErr(this.#adapter.platform, 'anonId', err.message);
		}
	}

	async getDebug(): Promise<string | null> {
		try {
			return await this.#adapter.get('DEBUG');
		} catch (err) {
			throw new StorageGetErr(this.#adapter.platform, 'DEBUG', err.message);
		}
	}
}
