/**
 * This file mocks the platform detection module
 * We mock hasExtension to return based on window.ethereum.isMetaMask
 */
import * as t from 'vitest';

t.vi.mock('../../src/domain/platform', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../src/domain/platform')>();
	return {
		...actual,
		hasExtension: t.vi.fn(async () => {
			if (typeof window === 'undefined') {
				return false;
			}
			return Boolean(window.ethereum?.isMetaMask);
		})
	};
});

