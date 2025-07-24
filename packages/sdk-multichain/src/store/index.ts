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
			const transport = await this.#adapter.getItem('multichain-transport');
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
			await this.#adapter.setItem('multichain-transport', transport);
		} catch (err) {
			throw new StorageSetErr(this.#adapter.platform, 'multichain-transport', err.message);
		}
	}

	async removeTransport(): Promise<void> {
		try {
			await this.#adapter.deleteItem('multichain-transport');
		} catch (err) {
			throw new StorageDeleteErr(this.#adapter.platform, 'multichain-transport', err.message);
		}
	}

	async getAnonId(): Promise<string> {
		try {
			const anonId = await this.#adapter.getItem('anonId');
			if (anonId) {
				return anonId;
			}
			const newAnonId = uuid.v4();
			await this.#adapter.setItem('anonId', newAnonId);
			return newAnonId;
		} catch (err) {
			throw new StorageGetErr(this.#adapter.platform, 'anonId', err.message);
		}
	}

	async getExtensionId(): Promise<string | null> {
		try {
			return await this.#adapter.getItem('extensionId');
		} catch (err) {
			throw new StorageGetErr(this.#adapter.platform, 'extensionId', err.message);
		}
	}

	async setAnonId(anonId: string): Promise<void> {
		try {
			return await this.#adapter.setItem('anonId', anonId);
		} catch (err) {
			throw new StorageSetErr(this.#adapter.platform, 'anonId', err.message);
		}
	}

	async setExtensionId(extensionId: string): Promise<void> {
		try {
			return await this.#adapter.setItem('extensionId', extensionId);
		} catch (err) {
			throw new StorageSetErr(this.#adapter.platform, 'extensionId', err.message);
		}
	}

	async removeExtensionId(): Promise<void> {
		try {
			return await this.#adapter.deleteItem('extensionId');
		} catch (err) {
			throw new StorageDeleteErr(this.#adapter.platform, 'extensionId', err.message);
		}
	}

	async removeAnonId(): Promise<void> {
		try {
			return await this.#adapter.deleteItem('anonId');
		} catch (err) {
			throw new StorageDeleteErr(this.#adapter.platform, 'anonId', err.message);
		}
	}

	async getDebug(): Promise<string | null> {
		try {
			return await this.#adapter.getItem('DEBUG');
		} catch (err) {
			throw new StorageGetErr(this.#adapter.platform, 'DEBUG', err.message);
		}
	}
}
