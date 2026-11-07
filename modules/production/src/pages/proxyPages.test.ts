import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';


/**
 * The Product block of the ribbon shows Inventory's product pages, copied from the commerce micro-app
 * at the same relative paths and read here as text, so nothing is imported across the module boundary.
 * A copy that drifts from its owner keeps compiling and only shows up as a page that publishes a
 * command or names a field the owner no longer has.
 */
const COMMERCE_SRC = resolve(__dirname, '../../../commerce/src');
const PRODUCTION_SRC = resolve(__dirname, '..');

const COPIED_FILES = [
	'constants/inventory.ts',
	'pages/inventory/productTemplate.ts',
	'pages/inventory/productVariant.ts',
	'pages/inventory/productVariantProduction.ts',
];

const COMMAND_FILES = [
	'productTemplate', 'productVariant', 'stockProductConfig', 'putawayRule', 'stockMove', 'stockQuant',
];

function read(path: string): string {
	return readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
}

/** The copy without its two-line proxy note. */
function withoutProxyNote(text: string): string {
	return text.replace(/^\/\/ Proxy copy of .*\n\/\/ .*\n/, '');
}

describe('proxy of commerce inventory product pages', () => {
	it.each(COPIED_FILES)('%s matches the owner file', (file) => {
		const copy = withoutProxyNote(read(resolve(PRODUCTION_SRC, file)));
		const original = read(resolve(COMMERCE_SRC, file));

		expect(copy).toBe(original);
	});

	it.each(COMMAND_FILES)('%s command names match the owner', (resource) => {
		const copy = read(resolve(PRODUCTION_SRC, `features/inventory/${resource}/commands.ts`));
		const owner = read(resolve(COMMERCE_SRC, `features/inventory/${resource}/commands.ts`));
		const copied = copy.match(/^export const \w+Commands = Object\.freeze\([\s\S]*?\);$/m)?.[0];

		expect(copied).toBeDefined();
		expect(owner).toContain(copied);
	});

	it('registers nothing for the owner: no schemas, services, handlers or stores', () => {
		for (const resource of COMMAND_FILES) {
			const text = read(resolve(PRODUCTION_SRC, `features/inventory/${resource}/commands.ts`));
			expect(text).not.toMatch(/schemaRegistry\.register|registerCrudService|registerSchemaModule|\.subscribe\(/);
		}
	});

	it('names the commerce view-kit components the template page renders', () => {
		const ids = read(resolve(COMMERCE_SRC, 'viewkit/inventory/ids.ts'));
		const props = read(resolve(PRODUCTION_SRC, 'viewkit/inventory/props.ts'));
		const used = [...props.matchAll(/'(nikkierp\.inventory\.components\.[\w.]+)'/g)].map(match => match[1]);

		expect(used.length).toBe(2);
		expect(used.filter(id => !ids.includes(`'${id}'`))).toEqual([]);
	});
});
