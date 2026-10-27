import { describe, expect, it } from 'vitest';

import { createSchemaCache } from './schema_cache';


function counter(value: string) {
	let calls = 0;
	return {
		load: async () => {
			calls++;
			return `${value}-${calls}`;
		},
		calls: () => calls,
	};
}

describe('createSchemaCache', () => {
	it('returns the cached value until the TTL expires', async () => {
		let clock = 1000;
		const cache = createSchemaCache({ ttlMs: 100, now: () => clock });
		const source = counter('a');
		expect(await cache.getOrLoad('k', source.load)).toBe('a-1');
		clock = 1099;
		expect(await cache.getOrLoad('k', source.load)).toBe('a-1');
		clock = 1100;
		expect(await cache.getOrLoad('k', source.load)).toBe('a-2');
	});

	it('keeps keys apart', async () => {
		const cache = createSchemaCache({ ttlMs: 100 });
		expect(await cache.getOrLoad('x', async () => 1)).toBe(1);
		expect(await cache.getOrLoad('y', async () => 2)).toBe(2);
	});

	it('de-duplicates concurrent loads of a key', async () => {
		const cache = createSchemaCache({ ttlMs: 100 });
		const source = counter('a');
		const values = await Promise.all([cache.getOrLoad('k', source.load), cache.getOrLoad('k', source.load)]);
		expect(values).toEqual(['a-1', 'a-1']);
		expect(source.calls()).toBe(1);
	});

	it('never caches a rejection; a joined caller loads (and caches) on its own', async () => {
		const cache = createSchemaCache({ ttlMs: 100 });
		const failing = cache.getOrLoad('k', () => Promise.reject(new Error('down')));
		const joined = cache.getOrLoad('k', async () => 'own');
		await expect(failing).rejects.toThrow('down');
		expect(await joined).toBe('own');
		expect(await cache.getOrLoad('k', async () => 'later')).toBe('own');
		expect(await cache.getOrLoad('r', () => Promise.reject(new Error('down'))).catch(() => 'rejected')).toBe('rejected');
		expect(await cache.getOrLoad('r', async () => 'retried')).toBe('retried');
	});

	it('never caches a value refused by isCacheable; a joined caller loads on its own', async () => {
		const cache = createSchemaCache({ ttlMs: 100 });
		const refused = (value: number) => value >= 0;
		const first = cache.getOrLoad('k', async () => -1, refused);
		const joined = cache.getOrLoad('k', async () => 7, refused);
		expect(await first).toBe(-1);
		expect(await joined).toBe(7);
		expect(await cache.getOrLoad('k', async () => 9, refused)).toBe(7);
	});

	it('forgets every entry on clear', async () => {
		const cache = createSchemaCache({ ttlMs: 100 });
		await cache.getOrLoad('k', async () => 1);
		cache.clear();
		expect(await cache.getOrLoad('k', async () => 2)).toBe(2);
	});
});
