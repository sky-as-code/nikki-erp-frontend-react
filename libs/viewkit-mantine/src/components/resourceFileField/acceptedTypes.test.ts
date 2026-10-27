import { describe, expect, it } from 'vitest';

import { resourceFileFieldPropsSchema } from './props';
import { acceptedTypes } from './ResourceFileField';


const plain = resourceFileFieldPropsSchema.parse({ field: 'logo', fileIdField: 'logo_file_id', label: 'logo' });
const byKind = resourceFileFieldPropsSchema.parse({
	field: 'media',
	fileIdField: 'media_file_id',
	label: 'media',
	kindField: 'media_type',
	acceptByKind: { image: ['image/png'], video: ['video/mp4'] },
});

describe('acceptedTypes', () => {
	it('keeps the plain accept list without a kind field', () => {
		expect(acceptedTypes(plain, undefined)).toEqual(plain.accept);
	});

	it('follows the chosen kind', () => {
		expect(acceptedTypes(byKind, 'video')).toEqual(['video/mp4']);
	});

	it('takes nothing until a kind is chosen', () => {
		expect(acceptedTypes(byKind, undefined)).toBeUndefined();
	});
});
