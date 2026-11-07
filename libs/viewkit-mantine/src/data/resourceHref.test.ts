import { describe, expect, it } from 'vitest';

import { buildModuleRoutes } from './moduleRoutes';
import { resolveRouteHref } from './resourceHref';


const OWNERS: Record<string, string> = { inventory: 'commerce', prod: 'production', mftr: 'production' };
const ownerSlugOf = (schemaName: string): string | undefined => OWNERS[schemaName.split('_')[0]];

/** Production: its own pages plus proxy copies of Commerce's product pages. */
const production = buildModuleRoutes(
	['prod_assembly', 'mftr_bom', 'inventory_product_template', 'inventory_product_variant'],
	{ inventory_product_template: 'commerce', inventory_product_variant: 'commerce' },
);

function resolve(routePath: string, pathPrefix?: string, moduleRoutes = production) {
	return resolveRouteHref({ routePath, pathPrefix, currentSlug: 'production', moduleRoutes, ownerSlugOf });
}

describe('resolveRouteHref', () => {
	it('keeps a route the module serves, its own page or a proxy copy', () => {
		expect(resolve('prod_assembly')).toBe('/production/prod_assembly');
		expect(resolve('inventory_product_variant')).toBe('/production/inventory_product_variant');
	});

	it('sends a route the module does not serve to the owner of the schema', () => {
		expect(resolve('inventory_stock_quant')).toBe('/commerce/inventory_stock_quant');
		expect(resolve('inventory_stock_transfer/T1/inventory_stock_move')).toBe(
			'/commerce/inventory_stock_transfer/T1/inventory_stock_move',
		);
	});

	it('uses an explicit prefix as given', () => {
		expect(resolve('inventory_stock_quant', '/production')).toBe('/production/inventory_stock_quant');
	});

	it('leaves an absolute path alone', () => {
		expect(resolve('/commerce/purchase_vendor_product_price')).toBe('/commerce/purchase_vendor_product_price');
	});

	it('keeps the current module for an unknown owner or outside a module router', () => {
		expect(resolve('unknown_thing')).toBe('/production/unknown_thing');
		expect(resolveRouteHref({
			routePath: 'inventory_stock_quant', currentSlug: 'production', moduleRoutes: null, ownerSlugOf,
		})).toBe('/production/inventory_stock_quant');
	});
});
