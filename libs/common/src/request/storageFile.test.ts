import { describe, expect, it } from 'vitest';

import { RequestMaker } from './request';
import { storageFileUrl, storageFileUrlOf } from './storageFile';


describe('storageFileUrl', () => {
	it('builds the BFF by-id download URL from the default base URL', () => {
		RequestMaker.initDefault({ baseUrl: '/api/' });
		expect(storageFileUrl('01JF1')).toBe('/api/v1/itstorage/files/01JF1/download');
		expect(storageFileUrl('01JF1', { download: true })).toBe('/api/v1/itstorage/files/01JF1/download?download=1');
	});

	it('answers null for a record without a file id', () => {
		expect(storageFileUrlOf(null)).toBeNull();
		expect(storageFileUrlOf('')).toBeNull();
		expect(storageFileUrlOf(42)).toBeNull();
	});
});
