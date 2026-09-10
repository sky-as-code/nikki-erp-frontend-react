import { describe, expect, it } from 'vitest';

import { resourceImportPropsSchema } from './props';


describe('resourceImportPropsSchema', () => {
	it('needs the schema and the list route to return to, and defaults the namespace', () => {
		const props = resourceImportPropsSchema.parse({
			schemaName: 'inventory_product_category', returnRoutePath: 'product_categories',
		});

		expect(props.translationNs).toBe('common');
		expect(props.testId).toBeUndefined();
	});

	it('rejects a page without a return route', () => {
		expect(() => resourceImportPropsSchema.parse({ schemaName: 'inventory_product_category' })).toThrow();
	});

	it('rejects an unknown key, so a misspelled prop fails where the page is authored', () => {
		expect(() => resourceImportPropsSchema.parse({
			schemaName: 'x', returnRoutePath: 'y', returnRoutPath: 'z',
		})).toThrow();
	});
});
