import { describe, expect, it } from 'vitest';

import { resourceListPropsSchema } from './props';


const minimal = { schemaName: 'inventory_product_category', translationNs: 'inventory', searchCommand: 'x.search' };

/**
 * Import is opt-in per page: the entry navigates to a route the module must also declare, and the
 * backend serves it only for resources on the composable engine, so a default of "on" would show a
 * button that 404s on every other list.
 */
describe('resourceListPropsSchema.importEnabled', () => {
	it('defaults to off', () => {
		expect(resourceListPropsSchema.parse(minimal).importEnabled).toBe(false);
	});

	it('accepts an explicit opt-in', () => {
		expect(resourceListPropsSchema.parse({ ...minimal, importEnabled: true }).importEnabled).toBe(true);
	});

	it('rejects a non-boolean', () => {
		expect(() => resourceListPropsSchema.parse({ ...minimal, importEnabled: 'yes' })).toThrow();
	});
});
