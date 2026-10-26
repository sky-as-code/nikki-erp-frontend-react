import { describe, expect, it } from 'vitest';

import { RequestMaker } from './request';
import { storageFileUrl, storageFileUrlOf } from './storageFile';


describe('storageFileUrl', () => {
	it('builds the BFF download URL from the default base URL with the path encoded', () => {
		RequestMaker.initDefault({ baseUrl: '/api/' });
		expect(storageFileUrl('org/o 1/F1.png')).toBe('/api/v1/itstorage/files/download?path=org%2Fo+1%2FF1.png');
		expect(storageFileUrl('a/F1.png', { download: true }))
			.toBe('/api/v1/itstorage/files/download?path=a%2FF1.png&download=1');
	});

	it('answers null for a record without a path', () => {
		expect(storageFileUrlOf(null)).toBeNull();
		expect(storageFileUrlOf('')).toBeNull();
		expect(storageFileUrlOf(42)).toBeNull();
	});
});
