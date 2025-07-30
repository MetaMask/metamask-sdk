import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoreAdapter } from '../../domain';

export class StoreAdapterRN extends StoreAdapter {
	readonly platform = 'rn';
	async get(key: string): Promise<string | null> {
		return AsyncStorage.getItem(key);
	}

	async set(key: string, value: string): Promise<void> {
		return AsyncStorage.setItem(key, value);
	}

	async delete(key: string): Promise<void> {
		return AsyncStorage.removeItem(key);
	}
}
