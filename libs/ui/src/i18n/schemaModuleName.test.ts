import { registerSchemaModule } from '@nikkierp/common/dynamicModel';
import { describe, expect, it } from 'vitest';

import { schemaModuleName } from './index';


describe('schemaModuleName', () => {
	it('uses the module a schema was registered under', () => {
		registerSchemaModule('vdmc_themes', 'vendingmachine');

		expect(schemaModuleName('vdmc_themes')).toBe('vendingmachine');
	});

	it('falls back to the schema-name prefix', () => {
		expect(schemaModuleName('inventory_product_template')).toBe('inventory');
	});

	it('has no module for a name without a prefix', () => {
		expect(schemaModuleName('orphan')).toBeUndefined();
	});
});
